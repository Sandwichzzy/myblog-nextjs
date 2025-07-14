interface PageLoadingIndicatorProps {
  message?: string;
  color?: "blue" | "purple" | "green" | "gray";
}

export default function PageLoadingIndicator({
  message = "正在加载...",
  color = "blue",
}: PageLoadingIndicatorProps) {
  const colorClasses = {
    blue: "border-blue-600",
    purple: "border-purple-600",
    green: "border-green-600",
    gray: "border-gray-600",
  };

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-10">
      <div className="bg-white rounded-lg shadow-lg p-4 border border-gray-200">
        <div className="flex items-center space-x-3">
          <div
            className={`animate-spin rounded-full h-5 w-5 border-b-2 ${colorClasses[color]}`}
          ></div>
          <span className="text-sm text-gray-700">{message}</span>
        </div>
      </div>
    </div>
  );
}
