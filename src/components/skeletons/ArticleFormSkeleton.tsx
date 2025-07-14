export default function ArticleFormSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题骨架屏 */}
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded-lg w-32 animate-pulse"></div>
          <div className="mt-2 h-5 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>

        {/* 文章表单骨架屏 */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="space-y-6">
            {/* 标题字段 */}
            <div>
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse mb-2"></div>
              <div className="h-10 bg-gray-200 rounded-md w-full animate-pulse"></div>
            </div>

            {/* Slug字段 */}
            <div>
              <div className="h-4 bg-gray-200 rounded w-12 animate-pulse mb-2"></div>
              <div className="h-10 bg-gray-200 rounded-md w-full animate-pulse"></div>
            </div>

            {/* 摘要字段 */}
            <div>
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse mb-2"></div>
              <div className="h-20 bg-gray-200 rounded-md w-full animate-pulse"></div>
            </div>

            {/* 标签字段 */}
            <div>
              <div className="h-4 bg-gray-200 rounded w-12 animate-pulse mb-2"></div>
              <div className="flex space-x-2">
                <div className="h-8 bg-gray-200 rounded-full w-16 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded-full w-20 animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded-full w-12 animate-pulse"></div>
              </div>
            </div>

            {/* 内容编辑器骨架屏 */}
            <div>
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse mb-2"></div>

              {/* 编辑器工具栏 */}
              <div className="border border-gray-200 rounded-t-md p-3 bg-gray-50">
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
              </div>

              {/* 编辑器内容区域 */}
              <div className="h-64 bg-gray-200 rounded-b-md animate-pulse"></div>
            </div>

            {/* 发布状态和按钮 */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="h-4 bg-gray-200 rounded w-4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              </div>

              <div className="flex space-x-3">
                <div className="h-10 bg-gray-200 rounded-md w-20 animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded-md w-16 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
