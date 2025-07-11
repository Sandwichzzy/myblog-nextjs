import { NextRequest } from "next/server";
import {
  withApiHandler,
  withMethodCheck,
  createSuccessResponse,
  createErrorResponse,
  parseJsonBody,
  withCache,
  getClientIP,
  checkRateLimit,
  ApiErrors,
} from "@/lib/api-utils";
import {
  validateBody,
  updateArticleSchema,
  slugParamSchema,
} from "@/lib/validations";
import {
  getArticleBySlug,
  updateArticle,
  deleteArticle,
  incrementViewCount,
  addTagsToArticle,
  removeTagsFromArticle,
} from "@/lib/articles";

// ============================================================================
// 文章详情 API 路由处理器
// ============================================================================
// 处理 /api/articles/[slug] 路由的 GET、PUT 和 DELETE 请求
// GET: 获取指定文章详情
// PUT: 更新指定文章（管理员功能）
// DELETE: 删除指定文章（管理员功能）
// ============================================================================

/**
 * GET /api/articles/[slug] - 获取文章详情
 *
 * 路径参数：
 * - slug: 文章的URL标识符
 *
 * 查询参数：
 * - increment_view: 是否增加浏览量 (默认: true)
 *
 * 响应格式：
 * {
 *   "success": true,
 *   "data": {
 *     "id": "uuid",
 *     "title": "文章标题",
 *     "slug": "article-slug",
 *     "content": "文章内容",
 *     "excerpt": "文章摘要",
 *     "published": true,
 *     "view_count": 100,
 *     "created_at": "2024-01-01T00:00:00Z",
 *     "updated_at": "2024-01-01T00:00:00Z",
 *     "tags": [...]
 *   }
 * }
 */
async function handleGetArticle(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // 1. 验证路径参数
  const { slug } = await params;
  if (!slug) {
    throw ApiErrors.badRequest("缺少文章标识符");
  }

  // 2. 验证slug格式
  try {
    slugParamSchema.parse({ slug });
  } catch (error) {
    throw ApiErrors.badRequest("无效的文章标识符格式");
  }

  // 3. 获取文章详情
  const article = await getArticleBySlug(slug);

  if (!article) {
    throw ApiErrors.notFound("文章不存在");
  }

  // 4. 检查是否需要增加浏览量
  const { searchParams } = new URL(req.url);
  const incrementView = searchParams.get("increment_view") !== "false";

  if (incrementView) {
    // 使用异步方式增加浏览量，不阻塞响应
    // 同时进行简单的防刷限制
    const clientIP = getClientIP(req);
    const viewKey = `view-${article.id}-${clientIP}`;

    if (!checkRateLimit(viewKey, 3, 60000)) {
      // 每分钟最多3次浏览计数
      // 异步执行，不等待结果
      incrementViewCount(article.id).catch((error) => {
        console.error("增加浏览量失败:", error);
      });
    }
  }

  // 5. 创建响应并设置缓存
  const response = createSuccessResponse(article, "文章详情获取成功");

  // 6. 设置缓存策略
  // 已发布文章缓存10分钟，未发布文章不缓存
  if (article.published) {
    return withCache(response, 600, 1800); // 10分钟缓存，30分钟stale-while-revalidate
  }

  return response;
}

/**
 * PUT /api/articles/[slug] - 更新文章
 *
 * 路径参数：
 * - slug: 文章的URL标识符
 *
 * 请求体格式（所有字段都是可选的）：
 * {
 *   "title": "新标题",
 *   "slug": "new-slug",
 *   "content": "新内容",
 *   "excerpt": "新摘要",
 *   "published": true,
 *   "tagIds": ["tag-uuid-1", "tag-uuid-2"]
 * }
 *
 * 响应格式：
 * {
 *   "success": true,
 *   "data": { ...updatedArticle },
 *   "message": "文章更新成功"
 * }
 */
async function handleUpdateArticle(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // 1. 限流检查
  const clientIP = getClientIP(req);
  if (checkRateLimit(`update-article-${clientIP}`, 20, 3600000)) {
    // 每小时最多20次更新
    throw ApiErrors.tooManyRequests("文章更新过于频繁，请稍后再试");
  }

  // 2. 验证管理员权限
  // TODO: 在实际项目中需要验证管理员权限
  // const user = await verifyAdminAuth(req)
  // if (!user) throw ApiErrors.unauthorized('需要管理员权限')

  // 3. 验证路径参数
  const { slug } = await params;
  if (!slug) {
    throw ApiErrors.badRequest("缺少文章标识符");
  }

  // 4. 检查文章是否存在
  const existingArticle = await getArticleBySlug(slug);
  if (!existingArticle) {
    throw ApiErrors.notFound("文章不存在");
  }

  // 5. 解析和验证请求体
  const body = await parseJsonBody(req);
  const validatedData = validateBody(updateArticleSchema, body);

  const {
    title,
    slug: newSlug,
    content,
    excerpt,
    published,
    tagIds,
  } = validatedData;

  // 6. 检查新slug的唯一性（如果有变更）
  if (newSlug && newSlug !== slug) {
    // TODO: 实现slug唯一性检查
    // const isUnique = await isSlugUnique(newSlug, existingArticle.id)
    // if (!isUnique) {
    //   throw ApiErrors.conflict('新的URL标识符已存在')
    // }
  }

  // 7. 准备更新数据
  const updateData: any = {};
  if (title !== undefined) updateData.title = title;
  if (newSlug !== undefined) updateData.slug = newSlug;
  if (content !== undefined) updateData.content = content;
  if (excerpt !== undefined) updateData.excerpt = excerpt;
  if (published !== undefined) updateData.published = published;

  // 8. 更新文章
  const updatedArticle = await updateArticle(existingArticle.id, updateData);

  // 9. 处理标签更新
  if (tagIds !== undefined) {
    // 先移除所有现有标签，然后添加新标签
    await removeTagsFromArticle(existingArticle.id);

    if (tagIds.length > 0) {
      await addTagsToArticle(existingArticle.id, tagIds);
    }
  }

  // 10. 记录操作日志
  console.log(`文章更新成功: ${updatedArticle.id} - ${updatedArticle.title}`);

  // 11. 返回成功响应
  return createSuccessResponse(updatedArticle, "文章更新成功");
}

/**
 * DELETE /api/articles/[slug] - 删除文章
 *
 * 路径参数：
 * - slug: 文章的URL标识符
 *
 * 响应格式：
 * {
 *   "success": true,
 *   "message": "文章删除成功"
 * }
 */
async function handleDeleteArticle(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // 1. 限流检查
  const clientIP = getClientIP(req);
  if (checkRateLimit(`delete-article-${clientIP}`, 5, 3600000)) {
    // 每小时最多5次删除
    throw ApiErrors.tooManyRequests("删除操作过于频繁，请稍后再试");
  }

  // 2. 验证管理员权限
  // TODO: 在实际项目中需要验证管理员权限
  // const user = await verifyAdminAuth(req)
  // if (!user) throw ApiErrors.unauthorized('需要管理员权限')

  // 3. 验证路径参数
  const { slug } = await params;
  if (!slug) {
    throw ApiErrors.badRequest("缺少文章标识符");
  }

  // 4. 检查文章是否存在
  const existingArticle = await getArticleBySlug(slug);
  if (!existingArticle) {
    throw ApiErrors.notFound("文章不存在");
  }

  // 5. 执行删除操作
  // 注意：由于数据库设计中有级联删除，相关的标签关联和评论会自动删除
  await deleteArticle(existingArticle.id);

  // 6. 记录操作日志
  console.log(`文章删除成功: ${existingArticle.id} - ${existingArticle.title}`);

  // 7. 返回成功响应
  return createSuccessResponse(null, "文章删除成功");
}

// ============================================================================
// 导出的路由处理器
// ============================================================================

/**
 * GET 请求处理器 - 获取文章详情
 */
export const GET = withApiHandler(withMethodCheck(["GET"])(handleGetArticle));

/**
 * PUT 请求处理器 - 更新文章
 */
export const PUT = withApiHandler(
  withMethodCheck(["PUT"])(handleUpdateArticle)
);

/**
 * DELETE 请求处理器 - 删除文章
 */
export const DELETE = withApiHandler(
  withMethodCheck(["DELETE"])(handleDeleteArticle)
);

// ============================================================================
// 类型定义和接口文档
// ============================================================================

/**
 * API 接口文档注释
 *
 * @swagger
 * /api/articles/{slug}:
 *   get:
 *     summary: 获取文章详情
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *           pattern: ^[a-z0-9-]+$
 *         description: 文章URL标识符
 *       - in: query
 *         name: increment_view
 *         schema:
 *           type: boolean
 *           default: true
 *         description: 是否增加浏览量
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
 *                   $ref: '#/components/schemas/ArticleWithTags'
 *       400:
 *         description: 请求参数错误
 *       404:
 *         description: 文章不存在
 *       500:
 *         description: 服务器错误
 *
 *   put:
 *     summary: 更新文章
 *     tags: [Articles]
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: 文章URL标识符
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateArticleInput'
 *     responses:
 *       200:
 *         description: 更新成功
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
 *       404:
 *         description: 文章不存在
 *       409:
 *         description: 资源冲突
 *       422:
 *         description: 数据验证失败
 *       429:
 *         description: 请求过于频繁
 *       500:
 *         description: 服务器错误
 *
 *   delete:
 *     summary: 删除文章
 *     tags: [Articles]
 *     security:
 *       - AdminAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: 文章URL标识符
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 文章不存在
 *       429:
 *         description: 请求过于频繁
 *       500:
 *         description: 服务器错误
 */
