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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                评论管理 (API版本)
              </h1>
              <p className="mt-2 text-gray-600">审核和管理用户评论</p>
            </div>

            {/* 版本切换 */}
            <div className="flex space-x-4">
              <a
                href="/admin/comments"
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md"
              >
                API版本 (当前)
              </a>
              <a
                href="/admin/comments-server"
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                切换到Server Actions版本
              </a>
            </div>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">总评论</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalComments}
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
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">待审核</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendingComments}
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
                  {stats.publishedComments}
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
