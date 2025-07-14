import Link from "next/link";
import { getPublishedArticles, getAllArticles } from "@/lib/articles";
import { getAllTagsSimple } from "@/lib/tags";

// 强制动态渲染，避免在构建时获取数据
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // 获取统计数据
  const [publishedResult, allResult, tags] = await Promise.all([
    getPublishedArticles(1, 5), // 获取最新5篇已发布文章
    getAllArticles(1, 1000), // 获取所有文章用于统计
    getAllTagsSimple(),
  ]);

  const recentArticles = publishedResult.articles;
  const totalArticles = allResult.totalCount;
  const publishedCount = allResult.articles.filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (a: any) => a.published
  ).length;
  const draftCount = totalArticles - publishedCount;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">管理后台</h1>
          <p className="mt-2 text-gray-600">欢迎回来，管理您的博客内容</p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总文章</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalArticles}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">已发布</p>
                <p className="text-2xl font-bold text-gray-900">
                  {publishedCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">草稿</p>
                <p className="text-2xl font-bold text-gray-900">{draftCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">标签</p>
                <p className="text-2xl font-bold text-gray-900">
                  {tags.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 快速操作 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 快速操作面板 */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">快速操作</h2>
            <div className="space-y-3">
              <Link
                href="/admin/articles/new"
                className="flex items-center w-full px-4 py-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-blue-600 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="text-blue-700 font-medium">创建新文章</span>
              </Link>

              <Link
                href="/admin/articles"
                className="flex items-center w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-gray-700 font-medium">管理文章</span>
              </Link>

              <Link
                href="/admin/tags"
                className="flex items-center w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
                <span className="text-gray-700 font-medium">管理标签</span>
              </Link>

              <Link
                href="/admin/comments"
                className="flex items-center w-full px-4 py-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span className="text-gray-700 font-medium">
                  管理评论 (API版本)
                </span>
              </Link>

              <Link
                href="/admin/comments-server"
                className="flex items-center w-full px-4 py-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <svg
                  className="w-5 h-5 text-green-600 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span className="text-green-700 font-medium">
                  管理评论 (Server Actions) 🚀
                </span>
              </Link>
            </div>
          </div>

          {/* 最新文章 */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">最新文章</h2>
              <Link
                href="/admin/articles"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                查看全部
              </Link>
            </div>

            <div className="space-y-4">
              {recentArticles.length > 0 ? (
                recentArticles.map(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (article: any) => (
                    <div
                      key={article.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          发布于{" "}
                          {new Date(article.created_at).toLocaleDateString(
                            "zh-CN"
                          )}
                          • {article.view_count} 次浏览
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            article.published
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {article.published ? "已发布" : "草稿"}
                        </span>
                        <Link
                          href={`/admin/articles/${article.slug}/edit`}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          编辑
                        </Link>
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className="text-center py-8">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">还没有文章</p>
                  <Link
                    href="/admin/articles/new"
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    创建第一篇文章
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "管理后台 - 我的博客",
  description: "博客管理后台首页",
};
