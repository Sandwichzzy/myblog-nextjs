// 文章列表页骨架屏
export default function ArticlesPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 搜索和筛选骨架屏 */}
      <div className="mb-8 animate-fade-in-up">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="h-10 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg animate-pulse"></div>
          </div>
          <div className="w-full sm:w-48">
            <div className="h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg animate-pulse"></div>
          </div>
        </div>

        {/* 标签筛选骨架屏 */}
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-6 w-16 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>

      {/* 文章网格骨架屏 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="web3-card p-6 animate-fade-in-up">
            <div className="h-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded animate-pulse mb-4"></div>
            <div className="h-3 bg-gradient-to-r from-gray-600 to-gray-700 rounded animate-pulse mb-2"></div>
            <div className="h-3 bg-gradient-to-r from-gray-600 to-gray-700 rounded animate-pulse mb-4"></div>
            <div className="flex gap-2 mb-4">
              <div className="h-6 w-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded animate-pulse"></div>
              <div className="h-6 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded animate-pulse"></div>
            </div>
            <div className="h-3 bg-gradient-to-r from-gray-600 to-gray-700 rounded animate-pulse"></div>
          </div>
        ))}
      </div>

      {/* 分页骨架屏 */}
      <div className="flex justify-center animate-fade-in-up">
        <div className="flex gap-2">
          <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded animate-pulse"></div>
          <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded animate-pulse"></div>
          <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
