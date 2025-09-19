interface LoadingSpinnerProps {
  message?: string;
  submessage?: string;
  size?: "sm" | "md" | "lg";
  color?: "blue" | "purple" | "green" | "gray";
}

export default function LoadingSpinner({
  message = "正在加载...",
  submessage = "请稍等",
  size = "md",
  color = "blue",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const colorClasses = {
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-pink-500",
    green: "from-green-500 to-emerald-500",
    gray: "from-gray-500 to-gray-600",
  };

  const spinnerSizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center">
        <div
          className={`inline-flex items-center justify-center ${sizeClasses[size]} mb-4 relative`}
        >
          {/* 主要旋转器 */}
          <div
            className={`animate-spin rounded-full ${spinnerSizeClasses[size]} bg-gradient-to-r ${colorClasses[color]} opacity-75`}
          ></div>
          {/* 外部光环效果 */}
          <div
            className={`absolute inset-0 animate-ping rounded-full ${spinnerSizeClasses[size]} bg-gradient-to-r ${colorClasses[color]} opacity-30`}
          ></div>
        </div>
        <h2 className="text-lg font-semibold">
          <span className="gradient-text">{message}</span>
        </h2>
        {submessage && (
          <p className="text-sm text-gray-300 mt-2">{submessage}</p>
        )}
      </div>
    </div>
  );
}

// 全屏加载组件
export function FullScreenLoading({
  message = "正在加载...",
  submessage = "请稍等",
  color = "blue",
}: Omit<LoadingSpinnerProps, "size">) {
  const colorClasses = {
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-pink-500",
    green: "from-green-500 to-emerald-500",
    gray: "from-gray-500 to-gray-600",
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900/95 via-blue-900/95 to-purple-900/95 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 relative">
          {/* 主要旋转器 */}
          <div
            className={`animate-spin rounded-full h-8 w-8 bg-gradient-to-r ${colorClasses[color]} opacity-75`}
          ></div>
          {/* 外部光环效果 */}
          <div
            className={`absolute inset-0 animate-ping rounded-full h-8 w-8 bg-gradient-to-r ${colorClasses[color]} opacity-30`}
          ></div>
        </div>
        <h2 className="text-lg font-semibold">
          <span className="gradient-text">{message}</span>
        </h2>
        {submessage && (
          <p className="text-sm text-gray-300 mt-2">{submessage}</p>
        )}
      </div>
    </div>
  );
}

// 骨架屏加载组件
export function SkeletonLoader() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded w-5/6"></div>
    </div>
  );
}

// 卡片骨架屏
export function CardSkeleton() {
  return (
    <div className="web3-card p-6 animate-pulse">
      <div className="h-6 bg-gradient-to-r from-gray-600 to-gray-700 rounded w-3/4 mb-4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded w-full"></div>
        <div className="h-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded w-5/6"></div>
        <div className="h-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded w-4/5"></div>
      </div>
    </div>
  );
}

// 表格行骨架屏
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-6 py-4">
          <div className="h-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded w-full"></div>
        </td>
      ))}
    </tr>
  );
}
