import Link from "next/link";
import { getAllArticles } from "@/lib/articles";
import { formatDate } from "@/lib/utils";
import { DeleteArticleButton } from "@/components";

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ArticlesManagePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = 20;

  // 获取所有文章（包括草稿）
  const result = await getAllArticles(page, limit);
  const { articles, totalCount, totalPages, currentPage } = result;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* 背景装饰效果 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题和操作 */}
        <div className="flex items-center justify-between mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              <span className="gradient-text">文章管理</span>
            </h1>
            <p className="text-gray-300">管理所有文章，包括已发布和草稿状态</p>
          </div>
          <Link
            href="/admin/articles/new"
            className="web3-button px-6 py-3 font-semibold uppercase tracking-wide"
          >
            创建新文章
          </Link>
        </div>

        {/* 统计信息 */}
        <div className="web3-card p-6 mb-6 animate-fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">
                <span className="neon-text">{totalCount}</span>
              </p>
              <p className="text-sm text-gray-300">总文章数</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-400">
                {articles.filter((a) => a.published).length}
              </p>
              <p className="text-sm text-gray-300">已发布</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-400">
                {articles.filter((a) => !a.published).length}
              </p>
              <p className="text-sm text-gray-300">草稿</p>
            </div>
          </div>
        </div>

        {/* 文章列表 */}
        <div className="web3-card overflow-hidden animate-fade-in-up">
          {articles.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-600">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      文章
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      创建时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {articles.map((article) => (
                    <tr
                      key={article.id}
                      className="hover:bg-gray-700/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-100">
                            {article.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            /{article.slug}
                          </p>
                          {article.excerpt && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {article.excerpt}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            article.published
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {article.published ? "已发布" : "草稿"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(article.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        {article.published ? (
                          <Link
                            href={`/articles/${article.slug}`}
                            className="text-blue-600 hover:text-blue-900"
                            target="_blank"
                          >
                            查看
                          </Link>
                        ) : (
                          <Link
                            href={`/admin/articles/${article.slug}/preview`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            预览
                          </Link>
                        )}
                        <Link
                          href={`/admin/articles/${article.slug}/edit`}
                          className="text-green-600 hover:text-green-900"
                        >
                          编辑
                        </Link>
                        <DeleteArticleButton
                          articleTitle={article.title}
                          slug={article.slug}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
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
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                还没有文章
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                开始创建您的第一篇文章吧。
              </p>
              <div className="mt-6">
                <Link
                  href="/admin/articles/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg
                    className="-ml-1 mr-2 h-5 w-5"
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
                  创建新文章
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              显示第 {(currentPage - 1) * limit + 1} 到{" "}
              {Math.min(currentPage * limit, totalCount)} 条， 共 {totalCount}{" "}
              条记录
            </div>
            <div className="flex space-x-1">
              {currentPage > 1 && (
                <Link
                  href={`/admin/articles?page=${currentPage - 1}`}
                  className="px-3 py-2 border border-gray-300 text-sm text-gray-700 bg-white hover:bg-gray-50 rounded-md"
                >
                  上一页
                </Link>
              )}

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, currentPage - 2) + i;
                if (pageNum > totalPages) return null;

                return (
                  <Link
                    key={pageNum}
                    href={`/admin/articles?page=${pageNum}`}
                    className={`px-3 py-2 border text-sm rounded-md ${
                      pageNum === currentPage
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </Link>
                );
              })}

              {currentPage < totalPages && (
                <Link
                  href={`/admin/articles?page=${currentPage + 1}`}
                  className="px-3 py-2 border border-gray-300 text-sm text-gray-700 bg-white hover:bg-gray-50 rounded-md"
                >
                  下一页
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const metadata = {
  title: "文章管理 - 我的博客管理后台",
  description: "管理所有博客文章",
};
