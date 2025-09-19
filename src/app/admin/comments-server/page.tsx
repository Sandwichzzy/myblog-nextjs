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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* 背景装饰效果 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题和切换链接 */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">
                <span className="gradient-text">
                  评论管理 (Server Actions版本)
                </span>
              </h1>
              <p className="text-gray-300">
                使用Server Actions直接处理评论操作，更快的响应速度
              </p>
            </div>

            {/* 版本切换 */}
            <div className="flex space-x-4">
              <a
                href="/admin/comments"
                className="px-4 py-2 text-sm bg-gray-700/50 text-gray-300 rounded-md hover:bg-gray-600/50 transition-colors border border-gray-600"
              >
                切换到API版本
              </a>
              <a
                href="/admin/comments-server"
                className="web3-button px-4 py-2 text-sm font-medium"
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
        <div className="mt-8 web3-card p-6 animate-fade-in-up">
          <h3 className="text-lg font-medium mb-4">
            <span className="gradient-text">🚀 Server Actions 优势</span>
          </h3>
          <ul className="text-gray-300 space-y-2">
            <li className="flex items-start">
              <span className="neon-text mr-2">•</span>
              <span>无需额外的HTTP请求，直接在服务器端执行</span>
            </li>
            <li className="flex items-start">
              <span className="neon-text mr-2">•</span>
              <span>自动处理缓存重新验证，页面状态自动更新</span>
            </li>
            <li className="flex items-start">
              <span className="neon-text mr-2">•</span>
              <span>更好的性能，减少网络延迟</span>
            </li>
            <li className="flex items-start">
              <span className="neon-text mr-2">•</span>
              <span>类型安全，编译时检查错误</span>
            </li>
            <li className="flex items-start">
              <span className="neon-text mr-2">•</span>
              <span>更简单的错误处理</span>
            </li>
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
