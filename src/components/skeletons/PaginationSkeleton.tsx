export default function PaginationSkeleton() {
  return (
    <div className="mt-6 flex items-center justify-between animate-fade-in-up">
      <div className="h-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded w-48 animate-pulse"></div>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md w-8 animate-pulse"
          ></div>
        ))}
      </div>
    </div>
  );
}
