interface AdminPageSkeletonProps {
  title?: boolean;
  stats?: number;
  actionButton?: boolean;
  children?: React.ReactNode;
}

export default function AdminPageSkeleton({
  title = true,
  stats = 0,
  actionButton = false,
  children,
}: AdminPageSkeletonProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* 背景装饰效果 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题和操作按钮骨架屏 */}
        {title && (
          <div className="flex items-center justify-between mb-8 animate-fade-in-up">
            <div>
              <div className="h-8 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg w-32 animate-pulse"></div>
              <div className="mt-2 h-5 bg-gradient-to-r from-gray-600 to-gray-700 rounded w-48 animate-pulse"></div>
            </div>
            {actionButton && (
              <div className="h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md w-24 animate-pulse"></div>
            )}
          </div>
        )}

        {/* 统计信息骨架屏 */}
        {stats > 0 && (
          <div className="web3-card p-6 mb-6 animate-fade-in-up">
            <div
              className={`grid grid-cols-1 gap-4 ${
                stats === 2
                  ? "md:grid-cols-2"
                  : stats === 3
                  ? "md:grid-cols-3"
                  : "md:grid-cols-2 lg:grid-cols-4"
              }`}
            >
              {Array.from({ length: stats }).map((_, i) => (
                <div key={i} className="text-center">
                  <div className="h-8 bg-gradient-to-r from-gray-600 to-gray-700 rounded w-12 mx-auto animate-pulse"></div>
                  <div className="mt-2 h-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded w-16 mx-auto animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 自定义内容 */}
        {children}
      </div>
    </div>
  );
}
