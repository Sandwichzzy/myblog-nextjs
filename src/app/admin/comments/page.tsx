import { Suspense } from "react";
import { CommentManagement, LoadingSpinner } from "@/components";
import { getPendingComments, getCommentStats } from "@/lib/comments";

// 强制动态渲染，避免在构建时获取数据
export const dynamic = "force-dynamic";

export default async function CommentsManagePage() {
  // 获取待审核评论和统计信息
  const [pendingResult, stats] = await Promise.all([
    getPendingComments(1, 50),
    getCommentStats(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* 背景装饰效果 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                <span className="gradient-text">评论管理 (API版本)</span>
              </h1>
              <p className="text-gray-300">审核和管理用户评论</p>
            </div>

            {/* 版本切换 */}
            <div className="flex space-x-4">
              <a
                href="/admin/comments"
                className="web3-button px-4 py-2 text-sm font-medium"
              >
                API版本 (当前)
              </a>
              <a
                href="/admin/comments-server"
                className="px-4 py-2 text-sm bg-gray-700/50 text-gray-300 rounded-md hover:bg-gray-600/50 transition-colors border border-gray-600"
              >
                切换到Server Actions版本
              </a>
            </div>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="web3-card p-6 group hover:scale-105 transition-transform duration-300 animate-fade-in-up">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center group-hover:animate-pulse">
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
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">总评论</p>
                <p className="text-2xl font-bold">
                  <span className="neon-text">{stats.totalComments}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="web3-card p-6 group hover:scale-105 transition-transform duration-300 animate-fade-in-up">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center group-hover:animate-pulse">
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">待审核</p>
                <p className="text-2xl font-bold">
                  <span className="text-yellow-400 font-bold">
                    {stats.pendingComments}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="web3-card p-6 group hover:scale-105 transition-transform duration-300 animate-fade-in-up">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center group-hover:animate-pulse">
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">已发布</p>
                <p className="text-2xl font-bold">
                  <span className="text-green-400 font-bold">
                    {stats.publishedComments}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 评论管理组件 */}
        <Suspense fallback={<LoadingSpinner message="正在加载评论..." />}>
          <CommentManagement
            initialComments={pendingResult.comments}
            showPendingOnly={true}
          />
        </Suspense>
      </div>
    </div>
  );
}

export async function generateMetadata() {
  return {
    title: "评论管理 - 管理后台",
    description: "审核和管理用户评论",
  };
}
