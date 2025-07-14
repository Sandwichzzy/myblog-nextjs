export default function PaginationSkeleton() {
  return (
    <div className="mt-6 flex items-center justify-between">
      <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-8 bg-gray-200 rounded-md w-8 animate-pulse"
          ></div>
        ))}
      </div>
    </div>
  );
}
