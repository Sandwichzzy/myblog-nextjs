import { NextRequest } from "next/server";
import {
  withApiHandler,
  withMethodCheck,
  createSuccessResponse,
  createPaginatedResponse,
  extractQueryParams,
  parseJsonBody,
  withSmartCache,
  CacheStrategies,
  withNoCache,
  getClientIP,
  checkRateLimit,
  sanitizeContent,
  ApiErrors,
} from "@/lib/api-utils";
import {
  validateQuery,
  validateBody,
  commentQuerySchema,
  createCommentSchema,
} from "@/lib/validations";
import {
  getArticleComments,
  getPendingComments,
  getAllComments,
  getAllPublishedComments,
  createComment,
} from "@/lib/comments";
import { supabaseAdmin } from "@/lib/supabase";

// ============================================================================
// 评论 API 路由处理器
// ============================================================================
// 处理 /api/comments 路由的 GET 和 POST 请求
// GET: 获取评论列表（支持分页、按文章筛选、审核状态筛选）
// POST: 创建新评论（公开功能，需要审核）
// ============================================================================

/**
 * GET /api/comments - 获取评论列表
 */
async function handleGetComments(req: NextRequest) {
  // 1. 提取和验证查询参数
  const queryParams = extractQueryParams(req);
  const validatedParams = validateQuery(commentQuerySchema, queryParams);

  const {
    page = 1,
    limit = 20,
    articleId,
    published: publishedString,
  } = validatedParams;

  // 手动转换 published 字符串为布尔值
  let published: boolean | undefined;
  if (publishedString === "true") {
    published = true;
  } else if (publishedString === "false") {
    published = false;
  } else if (publishedString === undefined) {
    published = undefined;
  } else {
    throw ApiErrors.badRequest(`Invalid published value: ${publishedString}`);
  }

  // 2. 检查是否需要管理员权限
  if (published === false || published === true || published === undefined) {
    // 这些都是管理员功能，需要验证权限
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      throw ApiErrors.unauthorized("管理员功能需要登录");
    }

    // 验证用户身份（基本验证，更严格的验证可以检查管理员角色）
    try {
      const {
        data: { user },
        error,
      } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));

      if (error || !user) {
        throw ApiErrors.unauthorized("用户身份验证失败");
      }

      // TODO: 这里可以添加更严格的管理员角色检查
      // const isAdmin = await isUserAdmin(user.id);
      // if (!isAdmin) throw ApiErrors.forbidden('需要管理员权限');
    } catch (authError) {
      console.error("权限验证失败:", authError);
      throw ApiErrors.unauthorized("权限验证失败");
    }
  }

  // 3. 根据查询条件选择合适的函数
  let result;

  if (articleId) {
    // 获取特定文章的评论（仅已发布）
    result = await getArticleComments(articleId, page, limit);
  } else if (published === false) {
    // 获取待审核评论（管理员功能）
    result = await getPendingComments(page, limit);
  } else if (published === true) {
    // 获取所有已发布评论（管理员功能）
    result = await getAllPublishedComments(page, limit);
  } else if (published === undefined) {
    // 获取所有评论（管理员功能）
    result = await getAllComments(page, limit);
  } else {
    // 默认情况
    result = {
      comments: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
    };
  }

  // 4. 创建分页响应
  const response = createPaginatedResponse(
    result.comments,
    {
      page: result.currentPage,
      limit,
      totalPages: result.totalPages,
      totalCount: result.totalCount,
    },
    "评论列表获取成功"
  );

  // 5. 设置缓存策略
  // 已发布评论使用动态内容缓存策略，未发布评论不缓存
  if (published !== false) {
    return withSmartCache(response, CacheStrategies.DYNAMIC);
  }

  return withNoCache(response);
}

/**
 * POST /api/comments - 创建新评论
 */
async function handleCreateComment(req: NextRequest) {
  // 1. 检查用户身份验证
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    throw ApiErrors.unauthorized("需要登录才能发表评论");
  }

  // 验证用户身份（使用 supabaseAdmin 客户端）
  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));

  if (authError || !user) {
    console.error("用户身份验证失败:", authError);
    throw ApiErrors.unauthorized("用户身份验证失败");
  }

  // 2. 严格限流检查（防止垃圾评论）
  const clientIP = getClientIP(req);
  if (checkRateLimit(`create-comment-${clientIP}`, 5, 300000)) {
    // 每5分钟最多5条评论
    throw ApiErrors.tooManyRequests("评论提交过于频繁，请稍后再试");
  }

  // 3. 解析和验证请求体
  const body = await parseJsonBody(req);
  const validatedData = validateBody(createCommentSchema, body);

  const { articleId, authorName, authorEmail, content } = validatedData;

  // 4. 内容安全检查和清理
  const sanitizedContent = sanitizeContent(content);
  const sanitizedAuthorName = sanitizeContent(authorName);

  // 5. 基础内容过滤（简单的垃圾内容检测）
  if (content.length < 2) {
    throw ApiErrors.badRequest("评论内容过短");
  }

  // 检查是否包含过多的链接或特殊字符（简单的垃圾评论检测）
  const linkCount = (content.match(/https?:\/\//g) || []).length;
  if (linkCount > 2) {
    throw ApiErrors.badRequest("评论中包含过多链接");
  }

  // 6. 创建评论（使用数据库字段格式）
  const commentData = {
    article_id: articleId,
    author_name: sanitizedAuthorName,
    author_email: authorEmail || null,
    content: sanitizedContent,
    published: false, // 新评论默认需要审核
    user_id: user.id, // 关联用户身份
  };

  const newComment = await createComment(commentData);

  // 7. 记录操作日志
  console.log(
    `评论创建成功: ${newComment.id} - ${authorName} (${user.email}) on ${articleId}`
  );

  // 8. 返回成功响应（转换字段名为前端格式）
  return createSuccessResponse(
    {
      id: newComment.id,
      articleId: newComment.article_id,
      authorName: newComment.author_name,
      authorEmail: newComment.author_email,
      content: newComment.content,
      published: newComment.published,
      userId: newComment.user_id,
      created_at: newComment.created_at,
    },
    "评论已提交，等待管理员审核后显示",
    201
  );
}

// ============================================================================
// 导出的路由处理器
// ============================================================================

/**
 * GET 请求处理器 - 获取评论列表
 */
export const GET = withApiHandler(withMethodCheck(["GET"])(handleGetComments));

/**
 * POST 请求处理器 - 创建新评论
 */
export const POST = withApiHandler(
  withMethodCheck(["POST"])(handleCreateComment)
);

// ============================================================================
// 类型定义和接口文档
// ============================================================================

/**
 * API 接口文档注释
 *
 * @swagger
 * /api/comments:
 *   get:
 *     summary: 获取评论列表
 *     tags: [Comments]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: 每页数量
 *       - in: query
 *         name: articleId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: 文章ID筛选
 *       - in: query
 *         name: published
 *         schema:
 *           type: boolean
 *         description: 发布状态筛选（管理员功能）
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权（查询未发布评论需要管理员权限）
 *       500:
 *         description: 服务器错误
 *
 *   post:
 *     summary: 创建新评论
 *     tags: [Comments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCommentInput'
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *                 message:
 *                   type: string
 *       400:
 *         description: 请求参数错误
 *       404:
 *         description: 文章不存在
 *       422:
 *         description: 数据验证失败
 *       429:
 *         description: 请求过于频繁
 *       500:
 *         description: 服务器错误
 */
