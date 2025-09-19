import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiResponse, PaginatedResponse } from "./validations";

// ============================================================================
// API 工具函数和错误处理
// ============================================================================
// 提供统一的API响应格式、错误处理和常用工具函数
// 确保API的一致性和可维护性
// ============================================================================

// ----------------------------------------------------------------------------
// 错误类型定义
// ----------------------------------------------------------------------------

// API错误类
export class ApiError extends Error {
  public statusCode: number;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

// 常见错误工厂函数
export const ApiErrors = {
  // 400 Bad Request
  badRequest: (message: string = "请求参数错误") =>
    new ApiError(message, 400, "BAD_REQUEST"),

  // 401 Unauthorized
  unauthorized: (message: string = "未授权访问") =>
    new ApiError(message, 401, "UNAUTHORIZED"),

  // 403 Forbidden
  forbidden: (message: string = "禁止访问") =>
    new ApiError(message, 403, "FORBIDDEN"),

  // 404 Not Found
  notFound: (message: string = "资源不存在") =>
    new ApiError(message, 404, "NOT_FOUND"),

  // 409 Conflict
  conflict: (message: string = "资源冲突") =>
    new ApiError(message, 409, "CONFLICT"),

  // 422 Unprocessable Entity
  validationError: (message: string = "数据验证失败") =>
    new ApiError(message, 422, "VALIDATION_ERROR"),

  // 429 Too Many Requests
  tooManyRequests: (message: string = "请求过于频繁") =>
    new ApiError(message, 429, "TOO_MANY_REQUESTS"),

  // 500 Internal Server Error
  internal: (message: string = "服务器内部错误") =>
    new ApiError(message, 500, "INTERNAL_ERROR"),
};

// ----------------------------------------------------------------------------
// 响应工具函数
// ----------------------------------------------------------------------------

/**
 * 创建成功响应
 * @param data 响应数据
 * @param message 成功消息
 * @param status HTTP状态码
 * @returns NextResponse
 */
export function createSuccessResponse<T>(
  data?: T,
  message?: string,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };

  return NextResponse.json(response, { status });
}

/**
 * 创建分页成功响应
 * @param data 响应数据数组
 * @param pagination 分页信息
 * @param message 成功消息
 * @param status HTTP状态码
 * @returns NextResponse
 */
export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalCount: number;
  },
  message?: string,
  status: number = 200
): NextResponse<PaginatedResponse<T>> {
  const response: PaginatedResponse<T> = {
    success: true,
    data,
    pagination,
    message,
  };

  return NextResponse.json(response, { status });
}

/**
 * 创建错误响应
 * @param error 错误信息或Error对象
 * @param status HTTP状态码
 * @returns NextResponse
 */
export function createErrorResponse(
  error: string | Error | ApiError,
  status?: number
): NextResponse<ApiResponse> {
  let errorMessage: string;
  let statusCode: number = status || 500;

  if (error instanceof ApiError) {
    errorMessage = error.message;
    statusCode = error.statusCode;
  } else if (error instanceof ZodError) {
    // 处理Zod验证错误
    errorMessage = formatZodError(error);
    statusCode = 422;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else {
    errorMessage = String(error);
  }

  const response: ApiResponse = {
    success: false,
    error: errorMessage,
  };

  return NextResponse.json(response, { status: statusCode });
}

/**
 * 格式化Zod验证错误消息
 * @param error ZodError对象
 * @returns 格式化的错误消息
 */
function formatZodError(error: ZodError): string {
  const errorMessages = error.errors.map((err) => {
    const path = err.path.join(".");
    return path ? `${path}: ${err.message}` : err.message;
  });

  return `数据验证失败: ${errorMessages.join(", ")}`;
}

// ----------------------------------------------------------------------------
// API请求处理包装器
// ----------------------------------------------------------------------------

/**
 * API路由处理包装器，提供统一的错误处理
 * @param handler API处理函数
 * @returns 包装后的处理函数
 */
export function withApiHandler<T>(
  handler: (req: NextRequest, context: T) => Promise<NextResponse | Response>
) {
  return async (req: NextRequest, context: T): Promise<NextResponse> => {
    try {
      const result = await handler(req, context);
      return result instanceof NextResponse
        ? result
        : new NextResponse(result.body, result);
    } catch (error) {
      console.error("API Error:", error);

      // 记录错误到日志系统（生产环境中可以集成外部日志服务）
      if (process.env.NODE_ENV === "production") {
        // TODO: 集成错误日志服务（如 Sentry）
      }

      return createErrorResponse(error as Error);
    }
  };
}

/**
 * 方法检查中间件
 * @param allowedMethods 允许的HTTP方法
 * @returns 中间件函数
 */
export function withMethodCheck(allowedMethods: string[]) {
  return function <T>(
    handler: (req: NextRequest, context: T) => Promise<NextResponse>
  ) {
    return async (req: NextRequest, context: T): Promise<NextResponse> => {
      if (!allowedMethods.includes(req.method)) {
        return createErrorResponse(
          `方法 ${req.method} 不被允许。支持的方法: ${allowedMethods.join(
            ", "
          )}`,
          405
        );
      }

      return handler(req, context);
    };
  };
}

// ----------------------------------------------------------------------------
// 数据处理工具函数
// ----------------------------------------------------------------------------

/**
 * 安全地解析JSON请求体
 * @param req NextRequest对象
 * @returns 解析后的JSON数据
 */
export async function parseJsonBody(req: NextRequest): Promise<unknown> {
  try {
    const text = await req.text();
    return text ? JSON.parse(text) : {};
  } catch {
    throw ApiErrors.badRequest("无效的JSON格式");
  }
}

/**
 * 从URL中提取查询参数
 * @param req NextRequest对象
 * @returns 查询参数对象
 */
export function extractQueryParams(
  req: NextRequest
): Record<string, string | string[]> {
  const { searchParams } = new URL(req.url);
  const params: Record<string, string | string[]> = {};

  for (const [key, value] of searchParams.entries()) {
    if (params[key]) {
      // 如果键已存在，转换为数组
      if (Array.isArray(params[key])) {
        (params[key] as string[]).push(value);
      } else {
        params[key] = [params[key] as string, value];
      }
    } else {
      params[key] = value;
    }
  }

  return params;
}

/**
 * 生成URL友好的slug
 * @param title 文章标题
 * @returns slug字符串
 */
export function generateSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      // 将中文等非ASCII字符移除或替换
      .replace(/[^\w\s-]/g, "")
      // 将空格和下划线替换为连字符
      .replace(/[\s_]+/g, "-")
      // 移除多个连续的连字符
      .replace(/-+/g, "-")
      // 移除开头和结尾的连字符
      .replace(/^-+|-+$/g, "")
  );
}

/**
 * 验证slug是否唯一
 * @param slug 要验证的slug
 * @param excludeId 排除的文章ID（用于更新时）
 * @returns 是否唯一
 */
export async function isSlugUnique(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _slug: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _excludeId?: string
): Promise<boolean> {
  // 这里需要调用数据库查询，暂时返回true
  // 在实际实现中会导入相关的数据库查询函数
  return true;
}

/**
 * 生成唯一的slug
 * @param title 文章标题
 * @param excludeId 排除的文章ID
 * @returns 唯一的slug
 */
export async function generateUniqueSlug(
  title: string,
  excludeId?: string
): Promise<string> {
  const baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;

  // 如果slug已存在，添加数字后缀
  while (!(await isSlugUnique(slug, excludeId))) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

// ----------------------------------------------------------------------------
// 缓存工具函数
// ----------------------------------------------------------------------------

/**
 * 智能缓存配置 - 根据环境和数据类型自动调整
 */
interface CacheConfig {
  // 开发环境缓存时间（秒）
  dev: {
    maxAge: number;
    staleWhileRevalidate: number;
  };
  // 生产环境缓存时间（秒）
  prod: {
    maxAge: number;
    staleWhileRevalidate: number;
  };
}

/**
 * 预定义的缓存配置策略
 */
export const CacheStrategies = {
  // 静态内容：文章详情、页面内容等
  STATIC: {
    dev: { maxAge: 0, staleWhileRevalidate: 0 }, // 开发环境不缓存
    prod: { maxAge: 600, staleWhileRevalidate: 1800 }, // 生产环境10分钟缓存
  } as CacheConfig,

  // 半静态内容：文章列表、标签列表等
  SEMI_STATIC: {
    dev: { maxAge: 0, staleWhileRevalidate: 0 }, // 开发环境不缓存
    prod: { maxAge: 120, staleWhileRevalidate: 300 }, // 生产环境2分钟缓存
  } as CacheConfig,

  // 动态内容：评论、用户数据等
  DYNAMIC: {
    dev: { maxAge: 0, staleWhileRevalidate: 0 }, // 开发环境不缓存
    prod: { maxAge: 60, staleWhileRevalidate: 180 }, // 生产环境1分钟缓存
  } as CacheConfig,

  // 频繁变化：搜索结果、实时数据等
  FREQUENT: {
    dev: { maxAge: 0, staleWhileRevalidate: 0 }, // 开发环境不缓存
    prod: { maxAge: 30, staleWhileRevalidate: 90 }, // 生产环境30秒缓存
  } as CacheConfig,

  // 极少变化：配置数据、静态资源等
  RARE_CHANGE: {
    dev: { maxAge: 0, staleWhileRevalidate: 0 }, // 开发环境不缓存
    prod: { maxAge: 3600, staleWhileRevalidate: 7200 }, // 生产环境1小时缓存
  } as CacheConfig,
};

/**
 * 智能设置响应缓存头 - 根据环境自动选择缓存策略
 * @param response NextResponse对象
 * @param strategy 缓存策略
 * @param customConfig 自定义配置（可选）
 * @returns 设置了缓存头的响应
 */
export function withSmartCache(
  response: NextResponse,
  strategy: CacheConfig = CacheStrategies.SEMI_STATIC,
  customConfig?: Partial<CacheConfig>
): NextResponse {
  // 合并自定义配置
  const config = customConfig
    ? {
        dev: { ...strategy.dev, ...customConfig.dev },
        prod: { ...strategy.prod, ...customConfig.prod },
      }
    : strategy;

  // 根据环境选择配置
  const isDev = process.env.NODE_ENV === "development";
  const cacheConfig = isDev ? config.dev : config.prod;

  // 如果是开发环境或缓存时间为0，则不缓存
  if (isDev || cacheConfig.maxAge === 0) {
    return withNoCache(response);
  }

  // 设置生产环境缓存
  response.headers.set(
    "Cache-Control",
    `public, max-age=${cacheConfig.maxAge}, s-maxage=${cacheConfig.maxAge}, stale-while-revalidate=${cacheConfig.staleWhileRevalidate}`
  );

  // 添加环境标识（便于调试）
  response.headers.set(
    "X-Cache-Strategy",
    isDev ? "dev-no-cache" : "prod-cached"
  );

  return response;
}

/**
 * 设置响应缓存头（保留原有函数以兼容现有代码）
 * @param response NextResponse对象
 * @param maxAge 缓存时间（秒）
 * @param staleWhileRevalidate 在重新验证时允许使用过期缓存的时间（秒）
 * @returns 设置了缓存头的响应
 */
export function withCache(
  response: NextResponse,
  maxAge: number = 60,
  staleWhileRevalidate: number = 300
): NextResponse {
  // 开发环境不缓存
  if (process.env.NODE_ENV === "development") {
    return withNoCache(response);
  }

  response.headers.set(
    "Cache-Control",
    `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=${staleWhileRevalidate}`
  );
  return response;
}

/**
 * 设置无缓存头
 * @param response NextResponse对象
 * @returns 设置了无缓存头的响应
 */
export function withNoCache(response: NextResponse): NextResponse {
  response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

// ----------------------------------------------------------------------------
// 限流工具函数
// ----------------------------------------------------------------------------

// 简单的内存限流实现（生产环境建议使用Redis）
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * 简单的限流检查
 * @param identifier 限流标识符（如IP地址）
 * @param limit 限制次数
 * @param windowMs 时间窗口（毫秒）
 * @returns 是否超出限制
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);

  if (!record || now > record.resetTime) {
    // 重置或创建新记录
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return false;
  }

  if (record.count >= limit) {
    return true; // 超出限制
  }

  record.count++;
  return false;
}

/**
 * 获取客户端IP地址
 * @param req NextRequest对象
 * @returns IP地址
 */
export function getClientIP(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const real = req.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (real) {
    return real;
  }

  return "unknown";
}

// ----------------------------------------------------------------------------
// 安全工具函数
// ----------------------------------------------------------------------------

/**
 * 清理HTML内容，防止XSS攻击
 * @param content 原始内容
 * @returns 清理后的内容
 */
export function sanitizeContent(content: string): string {
  // 基础的HTML实体编码
  return content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * 验证内容长度
 * @param content 内容
 * @param maxLength 最大长度
 * @returns 是否有效
 */
export function validateContentLength(
  content: string,
  maxLength: number
): boolean {
  return content.length <= maxLength;
}

// ----------------------------------------------------------------------------
// 环境工具函数
// ----------------------------------------------------------------------------

/**
 * 检查是否为开发环境
 * @returns 是否为开发环境
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

/**
 * 检查是否为生产环境
 * @returns 是否为生产环境
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === "production";
}

/**
 * 获取环境变量，如果不存在则抛出错误
 * @param key 环境变量键
 * @param defaultValue 默认值
 * @returns 环境变量值
 */
export function getRequiredEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
}
