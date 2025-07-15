import Link from "next/link";

interface SearchAndFilterServerProps {
  selectedTag?: string;
  availableTags?: Array<{
    id: string;
    name: string;
    color: string;
    count: number;
  }>;
  currentSearch?: string;
}

export default function SearchAndFilterServer({
  selectedTag,
  availableTags = [],
  currentSearch,
}: SearchAndFilterServerProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 搜索框 - 静态展示 */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <div className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              {currentSearch || "搜索文章..."}
            </div>
          </div>
        </div>

        {/* 标签筛选 - 静态展示 */}
        <div className="w-full sm:w-48">
          <div className="relative">
            <div className="block w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              {selectedTag || "选择标签"}
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 标签快速筛选 */}
      {availableTags.length > 0 && (
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {/* 全部标签链接 */}
            <Link
              href="/articles"
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                !selectedTag
                  ? "bg-blue-100 text-blue-800 border border-blue-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
              }`}
            >
              全部
            </Link>

            {/* 标签链接 */}
            {availableTags.slice(0, 8).map((tag) => (
              <Link
                key={tag.id}
                href={`/articles?tag=${encodeURIComponent(tag.name)}`}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border ${
                  selectedTag === tag.name
                    ? "text-white border-transparent"
                    : "text-gray-700 hover:bg-gray-100 border-gray-200"
                }`}
                style={{
                  backgroundColor:
                    selectedTag === tag.name ? tag.color : "transparent",
                  borderColor: selectedTag === tag.name ? tag.color : undefined,
                }}
              >
                {tag.name}
                {tag.count > 0 && (
                  <span className="ml-1 text-xs opacity-75">({tag.count})</span>
                )}
              </Link>
            ))}

            {availableTags.length > 8 && (
              <span className="px-3 py-1 text-sm text-gray-500">
                +{availableTags.length - 8} 更多
              </span>
            )}
          </div>
        </div>
      )}

      {/* 当前筛选状态显示 */}
      {(selectedTag || currentSearch) && (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">当前筛选:</span>

          {currentSearch && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              搜索: {currentSearch}
              <Link
                href="/articles"
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                ×
              </Link>
            </span>
          )}

          {selectedTag && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
              标签: {selectedTag}
              <Link
                href="/articles"
                className="ml-1 text-green-600 hover:text-green-800"
              >
                ×
              </Link>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
