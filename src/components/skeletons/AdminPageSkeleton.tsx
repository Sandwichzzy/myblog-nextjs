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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题和操作按钮骨架屏 */}
        {title && (
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="h-8 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
              <div className="mt-2 h-5 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>
            {actionButton && (
              <div className="h-10 bg-gray-200 rounded-md w-24 animate-pulse"></div>
            )}
          </div>
        )}

        {/* 统计信息骨架屏 */}
        {stats > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
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
                  <div className="h-8 bg-gray-200 rounded w-12 mx-auto animate-pulse"></div>
                  <div className="mt-2 h-4 bg-gray-200 rounded w-16 mx-auto animate-pulse"></div>
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
