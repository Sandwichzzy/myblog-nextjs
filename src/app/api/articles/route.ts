import { NextRequest } from "next/server";
import {
  withApiHandler,
  withMethodCheck,
  createSuccessResponse,
  createPaginatedResponse,
  createErrorResponse,
  extractQueryParams,
  parseJsonBody,
  withCache,
  getClientIP,
  checkRateLimit,
  ApiErrors,
} from "@/lib/api-utils";
import {
  validateQuery,
  validateBody,
  articleQuerySchema,
  createArticleSchema,
  ArticleQueryParams,
  CreateArticleInput,
} from "@/lib/validations";
import {
  getPublishedArticles,
  getAllArticles,
  createArticle,
  addTagsToArticle,
} from "@/lib/articles";
import { createTagsIfNotExist } from "@/lib/tags";

// ============================================================================
// 文章 API 路由处理器
// ============================================================================
// 处理 /api/articles 路由的 GET 和 POST 请求
// GET: 获取文章列表（支持分页、搜索、标签筛选）
// POST: 创建新文章（管理员功能）
// ============================================================================

/**
 * GET /api/articles - 获取文章列表
 *
 * 查询参数：
 * - page: 页码 (默认: 1)
 * - limit: 每页数量 (默认: 10, 最大: 100)
 * - tag: 标签筛选
 * - search: 搜索关键词
 * - published: 发布状态筛选 (默认只返回已发布文章)
 *
 * 响应格式：
 * {
 *   "success": true,
 *   "data": [...articles],
 *   "pagination": {
 *     "page": 1,
 *     "limit": 10,
 *     "totalPages": 5,
 *     "totalCount": 50
 *   }
 * }
 */
async function handleGetArticles(req: NextRequest) {
  // 1. 提取和验证查询参数
  const queryParams = extractQueryParams(req);
  const validatedParams = validateQuery(articleQuerySchema, queryParams);

  // 确保默认值生效
  const { page = 1, limit = 10, tag, search, published } = validatedParams;

  // 2. 检查是否有管理员权限（如果查询未发布文章）
  if (published === false) {
    // TODO: 在实际项目中需要验证管理员权限
    // const user = await verifyAdminAuth(req)
    // if (!user) throw ApiErrors.unauthorized('需要管理员权限')
  }

  // 3. 根据权限选择合适的查询函数
  let result;

  if (
    published === false ||
    (published === undefined && process.env.NODE_ENV === "development")
  ) {
    // 管理员模式：获取所有文章（包括草稿）
    result = await getAllArticles(page, limit);
  } else {
    // 公开模式：只获取已发布文章
    result = await getPublishedArticles(page, limit, tag);
  }

  // 4. 如果有搜索条件，进行搜索过滤
  if (search) {
    // TODO: 实现搜索功能
    // result = await searchArticles(search, page, limit)
  }

  // 5. 创建分页响应并设置缓存
  const response = createPaginatedResponse(
    result.articles,
    {
      page: result.currentPage,
      limit,
      totalPages: result.totalPages,
      totalCount: result.totalCount,
    },
    "文章列表获取成功"
  );

  // 6. 设置缓存策略
  // 已发布文章缓存5分钟，草稿文章不缓存
  if (published !== false) {
    return withCache(response, 300, 600); // 5分钟缓存，10分钟stale-while-revalidate
  }

  return response;
}

/**
 * POST /api/articles - 创建新文章
 *
 * 请求体格式：
 * {
 *   "title": "文章标题",
 *   "slug": "article-slug",
 *   "content": "文章内容（Markdown）",
 *   "excerpt": "文章摘要",
 *   "published": false,
 *   "tagIds": ["tag-uuid-1", "tag-uuid-2"]
 * }
 *
 * 响应格式：
 * {
 *   "success": true,
 *   "data": { ...article },
 *   "message": "文章创建成功"
 * }
 */
async function handleCreateArticle(req: NextRequest) {
  // 1. 限流检查（防止垃圾内容）
  const clientIP = getClientIP(req);
  if (checkRateLimit(`create-article-${clientIP}`, 10, 3600000)) {
    // 每小时最多10篇
    throw ApiErrors.tooManyRequests("文章创建过于频繁，请稍后再试");
  }

  // 2. 验证管理员权限
  // TODO: 在实际项目中需要验证管理员权限
  // const user = await verifyAdminAuth(req)
  // if (!user) throw ApiErrors.unauthorized('需要管理员权限')

  // 3. 解析和验证请求体
  const body = await parseJsonBody(req);
  const validatedData = validateBody(createArticleSchema, body);

  // 确保默认值生效
  const {
    title,
    slug,
    content,
    excerpt,
    published = false,
    tagIds = [],
  } = validatedData;

  // 4. 检查slug唯一性
  // TODO: 实现slug唯一性检查
  // const isUnique = await isSlugUnique(slug)
  // if (!isUnique) {
  //   throw ApiErrors.conflict('该URL标识符已存在，请使用其他标识符')
  // }

  // 5. 处理标签关联
  let processedTagIds: string[] = [];
  if (tagIds && tagIds.length > 0) {
    // 验证标签是否存在，如果不存在则创建
    // 注意：这里只是获取ID，实际的标签创建逻辑需要根据业务需求调整
    processedTagIds = tagIds;
  }

  // 6. 创建文章
  const articleData = {
    title,
    slug,
    content,
    excerpt: excerpt || null,
    published: published || false,
    // author_id: user.id // 实际项目中从认证信息获取
  };

  const newArticle = await createArticle(articleData);

  // 7. 关联标签
  if (processedTagIds.length > 0) {
    await addTagsToArticle(newArticle.id, processedTagIds);
  }

  // 8. 记录操作日志
  console.log(`文章创建成功: ${newArticle.id} - ${newArticle.title}`);

  // 9. 返回成功响应
  return createSuccessResponse(newArticle, "文章创建成功", 201);
}

// ============================================================================
// 导出的路由处理器
// ============================================================================

/**
 * GET 请求处理器 - 获取文章列表
 */
export const GET = withApiHandler(withMethodCheck(["GET"])(handleGetArticles));

/**
 * POST 请求处理器 - 创建新文章
 */
export const POST = withApiHandler(
  withMethodCheck(["POST"])(handleCreateArticle)
);

// ============================================================================
// 类型定义和接口文档
// ============================================================================

/**
 * API 接口文档注释
 *
 * @swagger
 * /api/articles:
 *   get:
 *     summary: 获取文章列表
 *     tags: [Articles]
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
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: 标签筛选
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *       - in: query
 *         name: published
 *         schema:
 *           type: boolean
 *         description: 发布状态筛选
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
 *                     $ref: '#/components/schemas/Article'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器错误
 *
 *   post:
 *     summary: 创建新文章
 *     tags: [Articles]
 *     security:
 *       - AdminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateArticleInput'
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
 *                   $ref: '#/components/schemas/Article'
 *                 message:
 *                   type: string
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       409:
 *         description: 资源冲突（如slug已存在）
 *       422:
 *         description: 数据验证失败
 *       429:
 *         description: 请求过于频繁
 *       500:
 *         description: 服务器错误
 */
