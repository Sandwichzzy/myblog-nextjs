import { SkeletonLoader } from "./LoadingSpinner";

export default function ArticlePreviewSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 管理员预览提示骨架屏 */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-blue-200 rounded animate-pulse"></div>
              <div className="h-4 bg-blue-200 rounded w-32 animate-pulse"></div>
            </div>
            <div className="flex space-x-2">
              <div className="h-8 bg-blue-200 rounded w-16 animate-pulse"></div>
              <div className="h-8 bg-blue-200 rounded w-16 animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* 面包屑骨架屏 */}
        <div className="flex items-center space-x-2 mb-6">
          <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-4 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>

        {/* 文章标题骨架屏 */}
        <div className="mb-6">
          <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
        </div>

        {/* 文章元信息骨架屏 */}
        <div className="flex flex-wrap items-center gap-6 mb-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
          </div>
        </div>

        {/* 文章摘要骨架屏 */}
        <div className="mb-8">
          <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          <div className="mt-2 h-5 bg-gray-200 rounded w-1/2 animate-pulse"></div>
        </div>

        {/* 标签骨架屏 */}
        <div className="flex flex-wrap gap-2 mb-8">
          <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded-full w-12 animate-pulse"></div>
        </div>

        {/* 文章内容骨架屏 */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="prose prose-gray max-w-none">
            <div className="space-y-6">
              {/* 模拟多个段落 */}
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <SkeletonLoader key={i} />
              ))}

              {/* 模拟代码块 */}
              <div className="bg-gray-100 rounded-md p-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                </div>
              </div>

              {/* 更多段落 */}
              {[9, 10, 11, 12].map((i) => (
                <SkeletonLoader key={i} />
              ))}
            </div>
          </div>
        </div>

        {/* 返回按钮骨架屏 */}
        <div className="mt-8">
          <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
