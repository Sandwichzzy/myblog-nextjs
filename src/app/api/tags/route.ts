import { NextRequest } from "next/server";
import {
  withApiHandler,
  withMethodCheck,
  createSuccessResponse,
  extractQueryParams,
  parseJsonBody,
  withCache,
  withNoCache,
  getClientIP,
  checkRateLimit,
  ApiErrors,
} from "@/lib/api-utils";
import {
  validateQuery,
  validateBody,
  tagQuerySchema,
  createTagSchema,
} from "@/lib/validations";
import {
  getPopularTags,
  searchTags,
  createTag,
  getTagsWithCount,
  getTagByName,
} from "@/lib/tags";

// ============================================================================
// 标签 API 路由处理器
// ============================================================================
// 处理 /api/tags 路由的 GET 和 POST 请求
// GET: 获取标签列表（支持搜索、热门标签）
// POST: 创建新标签（管理员功能）
// ============================================================================

/**
 * GET /api/tags - 获取标签列表
 *
 * 查询参数：
 * - search: 搜索关键词
 * - limit: 数量限制 (默认: 10, 最大: 50)
 * - popular: 是否只获取热门标签 (默认: false)
 *
 * 响应格式：
 * {
 *   "success": true,
 *   "data": [
 *     {
 *       "id": "uuid",
 *       "name": "标签名称",
 *       "color": "#3B82F6",
 *       "created_at": "2024-01-01T00:00:00Z",
 *       "article_count": 5
 *     }
 *   ]
 * }
 */
async function handleGetTags(req: NextRequest) {
  // 1. 提取和验证查询参数
  const queryParams = extractQueryParams(req);
  const validatedParams = validateQuery(tagQuerySchema, queryParams);

  const { search, limit = 10 } = validatedParams;
  const { searchParams } = new URL(req.url);
  const popular = searchParams.get("popular") === "true";

  // 2. 根据查询类型选择合适的函数
  let tags;

  if (popular) {
    // 获取热门标签（按文章数量排序）
    const popularTags = await getPopularTags(limit);
    tags = popularTags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      count: tag.article_count,
    }));
  } else if (search) {
    // 搜索标签
    const searchResults = await searchTags(search);
    // 为搜索结果添加文章计数（简化版本，设为0）
    tags = searchResults.map((tag) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      count: 0,
    }));
  } else {
    // 获取所有标签（带文章计数，用于筛选组件）
    tags = await getTagsWithCount();
  }

  // 3. 创建响应并设置缓存
  const response = createSuccessResponse(tags, "标签列表获取成功");

  // 4. 设置缓存策略
  // 检查是否有nocache参数，支持强制刷新
  const nocache = searchParams.get("nocache") === "true";

  if (nocache) {
    // 如果请求不使用缓存，直接返回
    return withNoCache(response);
  }

  // 标签数据相对稳定，但考虑到管理操作，缓存时间缩短为2分钟
  return withCache(response, 120, 300); // 2分钟缓存，5分钟stale-while-revalidate
}

/**
 * POST /api/tags - 创建新标签
 *
 * 请求体格式：
 * {
 *   "name": "标签名称",
 *   "color": "#3B82F6"
 * }
 *
 * 响应格式：
 * {
 *   "success": true,
 *   "data": {
 *     "id": "uuid",
 *     "name": "标签名称",
 *     "color": "#3B82F6",
 *     "created_at": "2024-01-01T00:00:00Z"
 *   },
 *   "message": "标签创建成功"
 * }
 */
async function handleCreateTag(req: NextRequest) {
  // 1. 限流检查
  const clientIP = getClientIP(req);
  if (checkRateLimit(`create-tag-${clientIP}`, 20, 3600000)) {
    // 每小时最多20个标签
    throw ApiErrors.tooManyRequests("标签创建过于频繁，请稍后再试");
  }

  // 2. 验证管理员权限
  // TODO: 在实际项目中需要验证管理员权限
  // const user = await verifyAdminAuth(req)
  // if (!user) throw ApiErrors.unauthorized('需要管理员权限')

  // 3. 解析和验证请求体
  const body = await parseJsonBody(req);
  const validatedData = validateBody(createTagSchema, body);

  const { name, color = "#3B82F6" } = validatedData;

  // 4. 检查标签名称是否已存在
  const existingTag = await getTagByName(name);
  if (existingTag) {
    throw ApiErrors.conflict(`标签名称 "${name}" 已存在，请使用其他名称`);
  }

  // 5. 创建标签
  const newTag = await createTag({
    name,
    color,
  });

  // 6. 为新标签添加article_count字段（新标签初始为0）
  const newTagWithCount = {
    ...newTag,
    article_count: 0,
  };

  // 7. 记录操作日志
  console.log(`标签创建成功: ${newTag.id} - ${newTag.name}`);

  // 8. 返回成功响应
  return createSuccessResponse(newTagWithCount, "标签创建成功", 201);
}

// ============================================================================
// 导出的路由处理器
// ============================================================================

/**
 * GET 请求处理器 - 获取标签列表
 */
export const GET = withApiHandler(withMethodCheck(["GET"])(handleGetTags));

/**
 * POST 请求处理器 - 创建新标签
 */
export const POST = withApiHandler(withMethodCheck(["POST"])(handleCreateTag));

// ============================================================================
// 类型定义和接口文档
// ============================================================================

/**
 * API 接口文档注释
 *
 * @swagger
 * /api/tags:
 *   get:
 *     summary: 获取标签列表
 *     tags: [Tags]
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: 数量限制
 *       - in: query
 *         name: popular
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 是否只获取热门标签
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
 *                     $ref: '#/components/schemas/TagWithCount'
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器错误
 *
 *   post:
 *     summary: 创建新标签
 *     tags: [Tags]
 *     security:
 *       - AdminAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTagInput'
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
 *                   $ref: '#/components/schemas/Tag'
 *                 message:
 *                   type: string
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       409:
 *         description: 标签名称已存在
 *       422:
 *         description: 数据验证失败
 *       429:
 *         description: 请求过于频繁
 *       500:
 *         description: 服务器错误
 */
