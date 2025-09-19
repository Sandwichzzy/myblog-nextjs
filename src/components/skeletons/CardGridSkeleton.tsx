interface CardGridSkeletonProps {
  columns?: 2 | 3 | 4;
  cards?: number;
  children?: React.ReactNode;
}

export default function CardGridSkeleton({
  columns = 4,
  cards = 4,
  children,
}: CardGridSkeletonProps) {
  const gridClasses = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div className={`grid grid-cols-1 ${gridClasses[columns]} gap-6 mb-8`}>
      {children ||
        Array.from({ length: cards }).map((_, i) => (
          <div
            key={i}
            className="web3-card p-6 group hover:scale-105 transition-transform duration-300 animate-fade-in-up"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg animate-pulse"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded w-16 animate-pulse"></div>
                <div className="mt-2 h-6 bg-gradient-to-r from-gray-600 to-gray-700 rounded w-12 animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
