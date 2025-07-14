import { Suspense } from "react";
import CommentManagementServer from "@/components/comments/CommentManagementServer";
import { LoadingSpinner } from "@/components";

interface PageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
  }>;
}

export default async function AdminCommentsServerPage({
  searchParams,
}: PageProps) {
  // 简化认证 - 先让页面渲染，在客户端组件中处理认证
  // 这避免了服务器端读取 cookies 的复杂性

  // 获取查询参数
  const { page = "1", limit = "20" } = await searchParams;
  const currentPage = parseInt(page);
  const pageLimit = parseInt(limit);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题和切换链接 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                评论管理 (Server Actions版本)
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                使用Server Actions直接处理评论操作，更快的响应速度
              </p>
            </div>

            {/* 版本切换 */}
            <div className="flex space-x-4">
              <a
                href="/admin/comments"
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                切换到API版本
              </a>
              <a
                href="/admin/comments-server"
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md"
              >
                Server Actions版本 (当前)
              </a>
            </div>
          </div>
        </div>

        {/* 评论管理组件 - 让它自己处理认证 */}
        <Suspense fallback={<LoadingSpinner message="正在加载评论..." />}>
          <CommentManagementServer
            initialPage={currentPage}
            initialLimit={pageLimit}
          />
        </Suspense>

        {/* 性能对比说明 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            🚀 Server Actions 优势
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• 无需额外的HTTP请求，直接在服务器端执行</li>
            <li>• 自动处理缓存重新验证，页面状态自动更新</li>
            <li>• 更好的性能，减少网络延迟</li>
            <li>• 类型安全，编译时检查错误</li>
            <li>• 更简单的错误处理</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// 生成页面元数据
export const metadata = {
  title: "评论管理 (Server Actions) - 管理后台",
  description: "使用Server Actions的高性能评论管理界面",
};
