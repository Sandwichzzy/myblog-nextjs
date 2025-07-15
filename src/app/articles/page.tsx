import { Suspense } from "react";
import { getPublishedArticles } from "@/lib/articles";
import { getTagsWithCount } from "@/lib/tags";
import { ArticleCard, Pagination, SearchAndFilterServer } from "@/components";
import { ArticlesPageClient } from "./ArticlesPageClient";
import { ArticlesPageSkeleton } from "@/components/skeletons";

// 配置ISR - 文章列表页每30分钟重新验证一次
export const revalidate = 1800; // 30分钟

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// 为文章列表页生成动态metadata
export async function generateMetadata({ searchParams }: PageProps) {
  const params = await searchParams;
  const tag = params.tag as string;
  const search = params.search as string;

  let title = "文章列表";
  let description = "浏览所有技术文章和生活感悟";

  if (tag) {
    title = `标签: ${tag} - 文章列表`;
    description = `浏览所有关于 ${tag} 的文章`;
  } else if (search) {
    title = `搜索: ${search} - 文章列表`;
    description = `搜索结果: ${search}`;
  }

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const tag = params.tag as string;
  const search = params.search as string;

  // 如果有搜索或复杂筛选，使用客户端组件
  if (search || params.refresh) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900">文章列表</h1>
            <p className="mt-2 text-gray-600">发现感兴趣的技术文章和生活感悟</p>
          </div>
        </div>

        <Suspense fallback={<ArticlesPageSkeleton />}>
          <ArticlesPageClient />
        </Suspense>
      </div>
    );
  }

  // 服务器端渲染基础页面（支持ISR）
  try {
    const [articlesResult, tags] = await Promise.all([
      getPublishedArticles(page, 12, tag),
      getTagsWithCount(),
    ]);

    const { articles, totalCount, totalPages, currentPage } = articlesResult;

    return (
      <div className="min-h-screen bg-gray-50">
        {/* 页面头部 */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900">文章列表</h1>
            <p className="mt-2 text-gray-600">
              发现感兴趣的技术文章和生活感悟
              {tag && <span className="ml-2 text-blue-600">· 标签: {tag}</span>}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 搜索和筛选 */}
          <div className="mb-8">
            <SearchAndFilterServer
              availableTags={tags}
              selectedTag={tag || ""}
              currentSearch={search || ""}
            />
          </div>

          {/* 文章列表 */}
          {articles.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {tag ? "没有找到相关文章" : "暂无文章"}
              </h2>
              <p className="text-gray-600">
                {tag ? `没有找到标签为 "${tag}" 的文章` : "还没有发布任何文章"}
              </p>
            </div>
          ) : (
            <>
              {/* 文章数量统计 */}
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  共找到 {totalCount} 篇文章
                  {tag && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {tag}
                    </span>
                  )}
                </p>
              </div>

              {/* 文章网格 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>

              {/* 分页 */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(newPage) => {
                    // 在服务器端版本中，这个会触发页面重新加载
                    const url = new URL(window.location.href);
                    url.searchParams.set("page", newPage.toString());
                    if (tag) url.searchParams.set("tag", tag);
                    window.location.href = url.toString();
                  }}
                />
              )}
            </>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error("加载文章列表失败:", error);

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900">文章列表</h1>
            <p className="mt-2 text-gray-600">加载失败，请稍后重试</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              加载失败
            </h2>
            <p className="text-gray-600 mb-4">无法加载文章列表，请稍后重试</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              重新加载
            </button>
          </div>
        </div>
      </div>
    );
  }
}
