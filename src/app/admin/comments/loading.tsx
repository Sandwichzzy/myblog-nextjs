import { AdminPageSkeleton, PageLoadingIndicator } from "@/components";

export default function CommentsLoading() {
  return (
    <AdminPageSkeleton title={true} stats={3}>
      {/* 评论管理界面骨架屏 */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* 表头 */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="flex items-center">
              <div className="h-4 bg-gray-200 rounded w-4 animate-pulse"></div>
              <div className="ml-3 h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
            </div>
          </div>

          {/* 评论项骨架屏 */}
          <div className="divide-y divide-gray-200">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="h-4 bg-gray-200 rounded w-4 animate-pulse mt-1"></div>
                  <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                      <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-32 animate-pulse mb-2"></div>
                    <div className="space-y-2 mb-3">
                      <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="h-6 bg-gray-200 rounded w-12 animate-pulse"></div>
                      <div className="h-6 bg-gray-200 rounded w-12 animate-pulse"></div>
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
  );
}
