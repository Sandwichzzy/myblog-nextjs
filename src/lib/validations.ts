import { z } from "zod";

// ============================================================================
// API 数据验证 Schemas
// ============================================================================
// 使用 Zod 库定义API请求和响应的数据结构验证规则
// 确保数据类型安全和业务规则一致性
// ============================================================================

// ----------------------------------------------------------------------------
// 文章相关验证规则
// ----------------------------------------------------------------------------

// 文章创建验证规则
export const createArticleSchema = z.object({
  // 标题：必填，1-255字符，去除前后空格
  title: z
    .string()
    .min(1, "标题不能为空")
    .max(255, "标题长度不能超过255字符")
    .trim(),

  // URL标识符：必填，只允许字母数字和连字符，用于SEO友好URL
  slug: z
    .string()
    .min(1, "Slug不能为空")
    .max(255, "Slug长度不能超过255字符")
    .regex(/^[a-z0-9-]+$/, "Slug只能包含小写字母、数字和连字符")
    .trim(),

  // 文章内容：必填，支持Markdown格式
  content: z
    .string()
    .min(1, "文章内容不能为空")
    .max(100000, "文章内容长度不能超过100000字符"),

  // 文章摘要：可选，用于SEO和列表页展示
  excerpt: z.string().max(500, "摘要长度不能超过500字符").optional().nullable(),

  // 发布状态：可选，默认为false（草稿状态）
  published: z.boolean().optional().default(false),

  // 标签ID数组：可选，用于关联文章和标签
  tagIds: z.array(z.string().uuid("无效的标签ID格式")).optional().default([]),
});

// 文章更新验证规则（所有字段都是可选的）
export const updateArticleSchema = createArticleSchema.partial();

// 文章查询参数验证规则
export const articleQuerySchema = z.object({
  // 页码：可选，默认为1，最小值为1
  page: z.coerce.number().int().min(1).optional().default(1),

  // 每页数量：可选，默认为10，范围1-100
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),

  // 标签筛选：可选，按标签名称筛选文章
  tag: z.string().optional(),

  // 搜索关键词：可选，全文搜索
  search: z.string().optional(),

  // 发布状态筛选：可选，用于管理后台
  published: z.coerce.boolean().optional(),
});

// ----------------------------------------------------------------------------
// 标签相关验证规则
// ----------------------------------------------------------------------------

// 标签创建验证规则
export const createTagSchema = z.object({
  // 标签名称：必填，1-100字符，唯一性
  name: z
    .string()
    .min(1, "标签名称不能为空")
    .max(100, "标签名称长度不能超过100字符")
    .trim(),

  // 标签颜色：可选，十六进制颜色值
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "颜色格式必须为十六进制（如：#3B82F6）")
    .optional()
    .default("#3B82F6"),
});

// 标签更新验证规则
export const updateTagSchema = createTagSchema.partial();

// 标签查询参数验证规则
export const tagQuerySchema = z.object({
  // 搜索关键词：可选，按标签名称搜索
  search: z.string().optional(),

  // 热门标签数量限制：可选，获取热门标签时使用
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
});

// ----------------------------------------------------------------------------
// 评论相关验证规则
// ----------------------------------------------------------------------------

// 评论创建验证规则
export const createCommentSchema = z.object({
  // 文章ID：必填，UUID格式
  articleId: z.string().uuid("无效的文章ID格式"),

  // 评论者姓名：必填，1-100字符
  authorName: z
    .string()
    .min(1, "姓名不能为空")
    .max(100, "姓名长度不能超过100字符")
    .trim(),

  // 评论者邮箱：可选，但如果提供必须是有效邮箱格式
  authorEmail: z.string().email("邮箱格式不正确").optional().nullable(),

  // 评论内容：必填，1-2000字符
  content: z
    .string()
    .min(1, "评论内容不能为空")
    .max(2000, "评论内容长度不能超过2000字符")
    .trim(),
});

// 评论更新验证规则（管理员功能）
export const updateCommentSchema = z.object({
  // 发布状态：可选，用于审核评论
  published: z.boolean().optional(),

  // 评论内容：可选，管理员可以编辑评论
  content: z
    .string()
    .min(1, "评论内容不能为空")
    .max(2000, "评论内容长度不能超过2000字符")
    .trim()
    .optional(),
});

// 评论查询参数验证规则
export const commentQuerySchema = z.object({
  // 页码：可选，默认为1
  page: z.coerce.number().int().min(1).optional().default(1),

  // 每页数量：可选，默认为20
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),

  // 发布状态筛选：可选，用于管理后台
  published: z.coerce.boolean().optional(),

  // 文章ID筛选：可选，获取特定文章的评论
  articleId: z.string().uuid().optional(),
});

// ----------------------------------------------------------------------------
// 通用验证规则
// ----------------------------------------------------------------------------

// UUID参数验证
export const uuidParamSchema = z.object({
  id: z.string().uuid("无效的ID格式"),
});

// Slug参数验证
export const slugParamSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug不能为空")
    .regex(/^[a-z0-9-]+$/, "Slug格式不正确"),
});

// 分页参数验证
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

// ----------------------------------------------------------------------------
// 响应数据类型定义
// ----------------------------------------------------------------------------

// API响应基础结构
export const apiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  error: z.string().optional(),
  message: z.string().optional(),
});

// 分页响应结构
export const paginatedResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.any()),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
    totalCount: z.number(),
  }),
  error: z.string().optional(),
  message: z.string().optional(),
});

// ----------------------------------------------------------------------------
// 类型导出（从 Zod schemas 推断 TypeScript 类型）
// ----------------------------------------------------------------------------

// 文章相关类型
export type CreateArticleInput = z.infer<typeof createArticleSchema>;
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>;
export type ArticleQueryParams = z.infer<typeof articleQuerySchema>;

// 标签相关类型
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
export type TagQueryParams = z.infer<typeof tagQuerySchema>;

// 评论相关类型
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type CommentQueryParams = z.infer<typeof commentQuerySchema>;

// 通用类型
export type UuidParam = z.infer<typeof uuidParamSchema>;
export type SlugParam = z.infer<typeof slugParamSchema>;
export type PaginationParams = z.infer<typeof paginationSchema>;
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
};
export type PaginatedResponse<T = unknown> = {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
  };
  error?: string;
  message?: string;
};

// ----------------------------------------------------------------------------
// 验证辅助函数
// ----------------------------------------------------------------------------

/**
 * 验证并转换查询参数
 * @param schema Zod验证规则
 * @param params 原始参数对象
 * @returns 验证后的参数对象
 */
export function validateQuery<T>(
  schema: z.ZodSchema<T>,
  params: Record<string, string | string[] | undefined>
): T {
  // 将URLSearchParams转换为普通对象
  const processedParams: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      // 处理数组参数
      if (Array.isArray(value)) {
        processedParams[key] = value;
      } else {
        processedParams[key] = value;
      }
    }
  }

  return schema.parse(processedParams);
}

/**
 * 验证请求体数据
 * @param schema Zod验证规则
 * @param body 请求体数据
 * @returns 验证后的数据
 */
export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown): T {
  return schema.parse(body);
}
