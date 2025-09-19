interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  // 如果只有一页，不显示分页
  if (totalPages <= 1) {
    return null;
  }

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // 总页数少于等于最大可见页数，显示所有页码
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 总页数多于最大可见页数，需要省略部分页码
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let start = Math.max(1, currentPage - halfVisible);
      let end = Math.min(totalPages, currentPage + halfVisible);

      // 调整起始和结束位置
      if (end - start + 1 < maxVisiblePages) {
        if (start === 1) {
          end = Math.min(totalPages, start + maxVisiblePages - 1);
        } else {
          start = Math.max(1, end - maxVisiblePages + 1);
        }
      }

      // 如果起始页不是1，添加第一页和省略号
      if (start > 1) {
        pages.push(1);
        if (start > 2) {
          pages.push("...");
        }
      }

      // 添加中间的页码
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // 如果结束页不是最后一页，添加省略号和最后一页
      if (end < totalPages) {
        if (end < totalPages - 1) {
          pages.push("...");
        }
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col items-center space-y-6 mt-12 animate-fade-in-up">
      {/* 分页按钮 */}
      <div className="flex items-center space-x-2">
        {/* 上一页按钮 */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`group flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
            currentPage === 1
              ? "text-gray-500 cursor-not-allowed bg-gray-800/50"
              : "text-gray-300 hover:text-white bg-gradient-to-r from-gray-700 to-gray-600 hover:from-blue-500 hover:to-purple-500 hover:shadow-lg hover:scale-105"
          }`}
        >
          <svg
            className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          上一页
        </button>

        {/* 页码按钮 */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((page, index) =>
            page === "..." ? (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-3 text-gray-500 flex items-center"
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
              </span>
            ) : (
              <button
                key={`page-${page}`}
                onClick={() => onPageChange(page as number)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 relative overflow-hidden group ${
                  currentPage === page
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg animate-neon-pulse"
                    : "text-gray-400 bg-gradient-to-r from-gray-800 to-gray-700 hover:from-gray-700 hover:to-gray-600 hover:text-white hover:scale-105"
                }`}
              >
                <span className="relative z-10">{page}</span>
                {currentPage === page && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse"></div>
                )}
              </button>
            )
          )}
        </div>

        {/* 下一页按钮 */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`group flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
            currentPage === totalPages
              ? "text-gray-500 cursor-not-allowed bg-gray-800/50"
              : "text-gray-300 hover:text-white bg-gradient-to-r from-gray-700 to-gray-600 hover:from-purple-500 hover:to-pink-500 hover:shadow-lg hover:scale-105"
          }`}
        >
          下一页
          <svg
            className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* 页码信息和快速跳转 */}
      <div className="flex flex-col sm:flex-row items-center gap-4 text-sm">
        {/* 页码信息 */}
        <div className="flex items-center text-gray-400">
          <svg
            className="w-4 h-4 mr-2 neon-text-blue"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          第 <span className="neon-text mx-1">{currentPage}</span> 页，共{" "}
          <span className="neon-text-purple mx-1">{totalPages}</span> 页
        </div>

        {/* 快速跳转 */}
        {totalPages > 10 && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400 text-xs">快速跳转:</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              className="w-16 px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none transition-colors"
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  const target = e.target as HTMLInputElement;
                  const pageNum = parseInt(target.value);
                  if (pageNum >= 1 && pageNum <= totalPages) {
                    onPageChange(pageNum);
                    target.value = "";
                  }
                }
              }}
            />
            <span className="text-gray-500 text-xs">页</span>
          </div>
        )}
      </div>

      {/* 进度条 */}
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>进度</span>
          <span>{Math.round((currentPage / totalPages) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500 ease-out"
            style={{ width: `${(currentPage / totalPages) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
