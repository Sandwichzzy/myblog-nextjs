interface PageLoadingIndicatorProps {
  message?: string;
  color?: "blue" | "purple" | "green" | "gray";
}

export default function PageLoadingIndicator({
  message = "正在加载...",
  color = "blue",
}: PageLoadingIndicatorProps) {
  const colorClasses = {
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-pink-500",
    green: "from-green-500 to-emerald-500",
    gray: "from-gray-500 to-gray-600",
  };

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-10">
      <div className="web3-card p-4 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div
              className={`animate-spin rounded-full h-5 w-5 bg-gradient-to-r ${colorClasses[color]} opacity-75`}
            ></div>
            <div
              className={`absolute inset-0 animate-ping rounded-full h-5 w-5 bg-gradient-to-r ${colorClasses[color]} opacity-30`}
            ></div>
          </div>
          <span className="text-sm text-gray-200 font-medium">{message}</span>
        </div>
      </div>
    </div>
  );
}
