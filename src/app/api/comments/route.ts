import { NextRequest } from "next/server";
import {
  withApiHandler,
  withMethodCheck,
  createSuccessResponse,
  createPaginatedResponse,
  extractQueryParams,
  parseJsonBody,
  withCache,
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
  createComment,
} from "@/lib/comments";

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

  const { page = 1, limit = 20, articleId, published } = validatedParams;

  // 2. 检查是否有管理员权限（如果查询未发布评论）
  if (published === false) {
    // TODO: 在实际项目中需要验证管理员权限
    // const user = await verifyAdminAuth(req)
    // if (!user) throw ApiErrors.unauthorized('需要管理员权限')
  }

  // 3. 根据查询条件选择合适的函数
  let result;

  if (articleId) {
    // 获取特定文章的评论（仅已发布）
    result = await getArticleComments(articleId, page, limit);
  } else if (published === false) {
    // 获取待审核评论（管理员功能）
    result = await getPendingComments(page, limit);
  } else {
    // 公开API默认返回空，因为没有获取所有已发布评论的函数
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
  // 已发布评论缓存5分钟，未发布评论不缓存
  if (published !== false) {
    return withCache(response, 300, 600); // 5分钟缓存，10分钟stale-while-revalidate
  }

  return withNoCache(response);
}

/**
 * POST /api/comments - 创建新评论
 */
async function handleCreateComment(req: NextRequest) {
  // 1. 严格限流检查（防止垃圾评论）
  const clientIP = getClientIP(req);
  if (checkRateLimit(`create-comment-${clientIP}`, 5, 300000)) {
    // 每5分钟最多5条评论
    throw ApiErrors.tooManyRequests("评论提交过于频繁，请稍后再试");
  }

  // 2. 解析和验证请求体
  const body = await parseJsonBody(req);
  const validatedData = validateBody(createCommentSchema, body);

  const { articleId, authorName, authorEmail, content } = validatedData;

  // 3. 内容安全检查和清理
  const sanitizedContent = sanitizeContent(content);
  const sanitizedAuthorName = sanitizeContent(authorName);

  // 4. 基础内容过滤（简单的垃圾内容检测）
  if (content.length < 2) {
    throw ApiErrors.badRequest("评论内容过短");
  }

  // 检查是否包含过多的链接或特殊字符（简单的垃圾评论检测）
  const linkCount = (content.match(/https?:\/\//g) || []).length;
  if (linkCount > 2) {
    throw ApiErrors.badRequest("评论中包含过多链接");
  }

  // 5. 创建评论（使用数据库字段格式）
  const commentData = {
    article_id: articleId,
    author_name: sanitizedAuthorName,
    author_email: authorEmail || null,
    content: sanitizedContent,
    published: false, // 新评论默认需要审核
  };

  const newComment = await createComment(commentData);

  // 6. 记录操作日志
  console.log(`评论创建成功: ${newComment.id} - ${authorName} on ${articleId}`);

  // 7. 返回成功响应（转换字段名为前端格式）
  return createSuccessResponse(
    {
      id: newComment.id,
      articleId: newComment.article_id,
      authorName: newComment.author_name,
      authorEmail: newComment.author_email,
      content: newComment.content,
      published: newComment.published,
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
