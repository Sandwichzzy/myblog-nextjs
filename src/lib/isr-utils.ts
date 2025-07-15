import { getPublishedArticles } from "./articles";
import { getTagsWithCount } from "./tags";
import { ArticleForDisplay } from "@/types/database";

// ISR 优化的数据获取函数
export interface ISRPageData {
  articles: ArticleForDisplay[];
  tags: Array<{ id: string; name: string; color: string; count: number }>;
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

// 为首页获取数据（ISR优化）
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

// 为文章列表页获取数据（ISR优化）
export async function getArticlesPageData(
  page: number = 1,
  limit: number = 12,
  tag?: string
): Promise<ISRPageData> {
  try {
    const [articlesResult, tags] = await Promise.all([
      getPublishedArticles(page, limit, tag),
      getTagsWithCount(),
    ]);

    return {
      articles: articlesResult.articles,
      tags,
      totalCount: articlesResult.totalCount,
      totalPages: articlesResult.totalPages,
      currentPage: articlesResult.currentPage,
    };
  } catch (error) {
    console.error("获取文章列表数据失败:", error);

    return {
      articles: [],
      tags: [],
      totalCount: 0,
      totalPages: 0,
      currentPage: page,
    };
  }
}

// 生成文章列表页的静态参数
export async function generateArticlesStaticParams(): Promise<
  Array<{ page: string }>
> {
  try {
    const result = await getPublishedArticles(1, 1000); // 获取所有文章来计算总页数
    const totalPages = Math.ceil(result.totalCount / 12);

    // 预生成前5页
    const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => ({
      page: (i + 1).toString(),
    }));

    return pages;
  } catch (error) {
    console.error("生成文章列表静态参数失败:", error);
    return [{ page: "1" }];
  }
}

// 为标签页面生成静态参数
export async function generateTagStaticParams(): Promise<
  Array<{ tag: string; page: string }>
> {
  try {
    const tags = await getTagsWithCount();
    const params: Array<{ tag: string; page: string }> = [];

    // 为每个标签生成第一页
    for (const tag of tags) {
      params.push({
        tag: tag.name,
        page: "1",
      });
    }

    return params;
  } catch (error) {
    console.error("生成标签静态参数失败:", error);
    return [];
  }
}

// ISR 缓存控制
export const ISR_CONFIG = {
  // 首页缓存时间（10分钟）
  HOME_REVALIDATE: 600,
  // 文章详情页缓存时间（1小时）
  ARTICLE_REVALIDATE: 3600,
  // 文章列表页缓存时间（30分钟）
  ARTICLES_LIST_REVALIDATE: 1800,
  // 标签页缓存时间（20分钟）
  TAG_PAGE_REVALIDATE: 1200,
} as const;

// 缓存标签
export const CACHE_TAGS = {
  ARTICLES: "articles",
  ARTICLE_DETAIL: "article-detail",
  TAGS: "tags",
  HOME: "home",
} as const;

// 手动触发ISR重新验证的函数
export async function revalidateISRPaths(paths: string[]): Promise<void> {
  if (process.env.NODE_ENV === "development") {
    console.log("开发环境跳过ISR重新验证");
    return;
  }

  try {
    // 在生产环境中，可以使用Next.js的revalidate API
    // 这里只是示例，实际实现需要根据部署环境调整
    for (const path of paths) {
      console.log(`重新验证路径: ${path}`);
      // await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate?path=${path}`);
    }
  } catch (error) {
    console.error("ISR重新验证失败:", error);
  }
}

// 常用的重新验证路径
export const REVALIDATE_PATHS = {
  HOME: "/",
  ARTICLES: "/articles",
  ARTICLE_DETAIL: (slug: string) => `/articles/${slug}`,
  TAG_PAGE: (tag: string) => `/articles?tag=${tag}`,
} as const;
