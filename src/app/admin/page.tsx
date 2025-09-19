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
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-12 text-center animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="gradient-text">管理控制台</span>
          </h1>
          <p className="text-gray-400 text-lg">
            欢迎回来，
            <span className="neon-text-purple"> 管理员 </span>-
            掌控您的Web3内容生态
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="web3-card p-6 group hover:scale-105 transition-transform duration-300 animate-fade-in-up">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:animate-pulse">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">总文章</p>
                <p className="text-3xl font-bold neon-text">{totalArticles}</p>
              </div>
            </div>
          </div>

          <div
            className="web3-card p-6 group hover:scale-105 transition-transform duration-300 animate-fade-in-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:animate-pulse">
                <svg
                  className="w-6 h-6 text-white"
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
                <p className="text-sm font-medium text-gray-400">已发布</p>
                <p className="text-3xl font-bold text-green-400">
                  {publishedCount}
                </p>
              </div>
            </div>
          </div>

          <div
            className="web3-card p-6 group hover:scale-105 transition-transform duration-300 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center group-hover:animate-pulse">
                <svg
                  className="w-6 h-6 text-white"
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
                <p className="text-sm font-medium text-gray-400">草稿</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {draftCount}
                </p>
              </div>
            </div>
          </div>

          <div
            className="web3-card p-6 group hover:scale-105 transition-transform duration-300 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:animate-pulse">
                <svg
                  className="w-6 h-6 text-white"
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
                <p className="text-sm font-medium text-gray-400">标签</p>
                <p className="text-3xl font-bold neon-text-purple">
                  {tags.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 快速操作面板 */}
          <div
            className="web3-card p-8 animate-fade-in-up"
            style={{ animationDelay: "0.4s" }}
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <svg
                className="w-6 h-6 mr-3 neon-text-blue"
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
              <span className="gradient-text">快速操作</span>
            </h2>
            <div className="space-y-4">
              <Link
                href="/admin/articles/new"
                className="flex items-center w-full px-6 py-4 text-left bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 border border-blue-500/30 hover:border-blue-500/50 rounded-xl transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <svg
                    className="w-5 h-5 text-white"
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
                </div>
                <div>
                  <span className="text-white font-semibold group-hover:neon-text transition-all">
                    创建新文章
                  </span>
                  <p className="text-gray-400 text-sm mt-1">发布您的Web3见解</p>
                </div>
              </Link>

              <Link
                href="/admin/articles"
                className="flex items-center w-full px-6 py-4 text-left bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border border-purple-500/30 hover:border-purple-500/50 rounded-xl transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <div>
                  <span className="text-white font-semibold group-hover:neon-text-purple transition-all">
                    管理文章
                  </span>
                  <p className="text-gray-400 text-sm mt-1">编辑和管理内容</p>
                </div>
              </Link>

              <Link
                href="/admin/tags"
                className="flex items-center w-full px-6 py-4 text-left bg-gradient-to-r from-green-500/10 to-blue-500/10 hover:from-green-500/20 hover:to-blue-500/20 border border-green-500/30 hover:border-green-500/50 rounded-xl transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <svg
                    className="w-5 h-5 text-white"
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
                <div>
                  <span className="text-white font-semibold group-hover:text-green-400 transition-all">
                    管理标签
                  </span>
                  <p className="text-gray-400 text-sm mt-1">分类和组织内容</p>
                </div>
              </Link>

              <Link
                href="/admin/comments"
                className="flex items-center w-full px-6 py-4 text-left bg-gradient-to-r from-orange-500/10 to-red-500/10 hover:from-orange-500/20 hover:to-red-500/20 border border-orange-500/30 hover:border-orange-500/50 rounded-xl transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                  <svg
                    className="w-5 h-5 text-white"
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
                </div>
                <div>
                  <span className="text-white font-semibold group-hover:text-orange-400 transition-all">
                    管理评论
                  </span>
                  <p className="text-gray-400 text-sm mt-1">
                    API版本 - 传统架构
                  </p>
                </div>
              </Link>

              <Link
                href="/admin/comments-server"
                className="flex items-center w-full px-6 py-4 text-left bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 border border-cyan-500/30 hover:border-cyan-500/50 rounded-xl transition-all duration-300 group relative overflow-hidden"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform animate-glow">
                  <svg
                    className="w-5 h-5 text-white"
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
                </div>
                <div>
                  <span className="text-white font-semibold group-hover:neon-text transition-all flex items-center">
                    管理评论
                    <span className="ml-2 text-xs bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-2 py-1 rounded-full animate-pulse">
                      推荐
                    </span>
                  </span>
                  <p className="text-gray-400 text-sm mt-1">
                    Server Actions - 现代化架构 🚀
                  </p>
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
            </div>
          </div>

          {/* 最新文章 */}
          <div
            className="lg:col-span-2 web3-card p-8 animate-fade-in-up"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <svg
                  className="w-6 h-6 mr-3 neon-text-purple"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H9a2 2 0 01-2-2z"
                  />
                </svg>
                <span className="gradient-text">最新文章</span>
              </h2>
              <Link
                href="/admin/articles"
                className="text-sm neon-text hover:animate-glow transition-all duration-300"
              >
                查看全部 →
              </Link>
            </div>

            <div className="space-y-4">
              {recentArticles.length > 0 ? (
                recentArticles.map(
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (article: any, index: number) => (
                    <div
                      key={article.id}
                      className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-xl hover:border-blue-500/50 transition-all duration-300 group"
                      style={{ animationDelay: `${0.1 * index}s` }}
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-white group-hover:neon-text transition-all mb-2">
                          {article.title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-400 space-x-4">
                          <span className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            {new Date(article.created_at).toLocaleDateString(
                              "zh-CN"
                            )}
                          </span>
                          <span className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            {article.view_count} 次浏览
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-3 py-1 text-xs rounded-full font-medium ${
                            article.published
                              ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 border border-green-500/30"
                              : "bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border border-yellow-500/30"
                          }`}
                        >
                          {article.published ? "已发布" : "草稿"}
                        </span>
                        <Link
                          href={`/admin/articles/${article.slug}/edit`}
                          className="text-blue-400 hover:neon-text hover:animate-glow text-sm font-medium transition-all duration-300"
                        >
                          编辑
                        </Link>
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                    <svg
                      className="w-10 h-10 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    还没有文章
                  </h3>
                  <p className="text-gray-400 mb-6">
                    开始创建您的第一篇Web3技术文章
                  </p>
                  <Link
                    href="/admin/articles/new"
                    className="web3-button inline-flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
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
  title: "管理控制台 - Web3 博客",
  description: "Web3博客管理后台控制台",
};
