import { getPublishedArticles } from "./articles";
import { ArticleForDisplay } from "@/types/database";

// ============================================================================
// ISR（增量静态再生）工具函数
// ============================================================================
// 为 Next.js 页面提供统一的 ISR 缓存配置和数据获取
// 与 api-utils.ts 的区别：
// - api-utils.ts: 处理 API 路由的 HTTP 缓存
// - isr-utils.ts: 处理页面级别的 ISR 静态缓存
// ============================================================================

/**
 * ISR 缓存时间配置（秒）
 * 根据环境自动调整：开发环境使用短缓存，生产环境使用长缓存
 */
export const ISR_REVALIDATE = {
  // 首页：展示最新文章，需要相对及时的更新
  HOME: process.env.NODE_ENV === "development" ? 10 : 600, // 开发10秒，生产10分钟

  // 文章详情：内容相对稳定，可以长时间缓存
  ARTICLE: process.env.NODE_ENV === "development" ? 10 : 3600, // 开发10秒，生产1小时

  // 文章列表：可能有新文章发布，中等缓存时间
  ARTICLES: process.env.NODE_ENV === "development" ? 10 : 1800, // 开发10秒，生产30分钟
} as const;

/**
 * 为首页获取数据（ISR 优化）
 * 获取最新的文章列表用于首页展示
 */
export async function getHomePageData(): Promise<{
  latestArticles: ArticleForDisplay[];
  totalCount: number;
}> {
  try {
    const result = await getPublishedArticles(1, 6); // 首页显示最新6篇文章

    return {
      latestArticles: result.articles,
      totalCount: result.totalCount,
    };
  } catch (error) {
    console.error("获取首页数据失败:", error);

    return {
      latestArticles: [],
      totalCount: 0,
    };
  }
}

/**
 * 缓存标签 - 用于 Next.js 的 revalidateTag
 */
export const CACHE_TAGS = {
  ARTICLES: "articles",
  ARTICLE_DETAIL: "article-detail",
  TAGS: "tags",
  HOME: "home",
} as const;

/**
 * 手动触发 ISR 重新验证（生产环境）
 * 当内容更新时，可以主动触发相关页面的重新生成
 */
export async function revalidatePages(paths: string[]): Promise<void> {
  if (process.env.NODE_ENV === "development") {
    console.log("开发环境跳过 ISR 重新验证");
    return;
  }

  try {
    // 在实际项目中，这里可以调用 Next.js 的 revalidate API
    // 或者使用 revalidateTag 来批量更新相关页面
    for (const path of paths) {
      console.log(`触发 ISR 重新验证: ${path}`);
      // 实际实现需要根据部署环境调整
    }
  } catch (error) {
    console.error("ISR 重新验证失败:", error);
  }
}

/**
 * 常用的页面路径 - 用于 ISR 重新验证
 */
export const PAGE_PATHS = {
  HOME: "/",
  ARTICLES: "/articles",
  ARTICLE_DETAIL: (slug: string) => `/articles/${slug}`,
} as const;
