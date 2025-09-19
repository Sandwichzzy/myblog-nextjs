import { AdminPageSkeleton, PageLoadingIndicator } from "@/components";

export default function CommentsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* 背景装饰效果 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        <AdminPageSkeleton title={true} stats={3}>
          {/* 评论管理界面骨架屏 */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="h-6 bg-gradient-to-r from-gray-600 to-gray-700 rounded w-32 animate-pulse"></div>
              <div className="h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded w-20 animate-pulse"></div>
            </div>

            <div className="web3-card overflow-hidden">
              {/* 表头 */}
              <div className="bg-gray-800/50 px-6 py-3 border-b border-gray-600">
                <div className="flex items-center">
                  <div className="h-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded w-4 animate-pulse"></div>
                  <div className="ml-3 h-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded w-12 animate-pulse"></div>
                </div>
              </div>

              {/* 评论项骨架屏 */}
              <div className="divide-y divide-gray-600">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="h-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded w-4 animate-pulse mt-1"></div>
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-pulse"></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="h-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded w-20 animate-pulse"></div>
                          <div className="h-3 bg-gradient-to-r from-gray-600 to-gray-700 rounded w-16 animate-pulse"></div>
                          <div className="h-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded w-12 animate-pulse"></div>
                        </div>
                        <div className="h-3 bg-gradient-to-r from-gray-600 to-gray-700 rounded w-32 animate-pulse mb-2"></div>
                        <div className="space-y-2 mb-3">
                          <div className="h-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded w-full animate-pulse"></div>
                          <div className="h-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded w-3/4 animate-pulse"></div>
                        </div>
                        <div className="flex space-x-2">
                          <div className="h-6 bg-gradient-to-r from-green-600 to-blue-600 rounded w-12 animate-pulse"></div>
                          <div className="h-6 bg-gradient-to-r from-red-600 to-pink-600 rounded w-12 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <PageLoadingIndicator message="正在加载评论管理..." color="purple" />
        </AdminPageSkeleton>
      </div>
    </div>
  );
}
