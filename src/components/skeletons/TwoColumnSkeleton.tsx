import { SkeletonLoader } from "./LoadingSpinner";

interface TwoColumnSkeletonProps {
  leftTitle?: string;
  rightTitle?: string;
  leftChildren?: React.ReactNode;
  rightChildren?: React.ReactNode;
  itemCount?: number;
}

export default function TwoColumnSkeleton({
  leftChildren,
  rightChildren,
  itemCount = 6,
}: TwoColumnSkeletonProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* 左侧内容 */}
      <div className="web3-card p-6 animate-fade-in-up">
        <div className="h-6 bg-gradient-to-r from-gray-600 to-gray-700 rounded w-20 animate-pulse mb-4"></div>
        {leftChildren || (
          <div className="space-y-4">
            <div>
              <div className="h-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded w-16 animate-pulse mb-2"></div>
              <div className="h-10 bg-gradient-to-r from-gray-700 to-gray-800 rounded-md w-full animate-pulse"></div>
            </div>
            <div>
              <div className="h-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded w-12 animate-pulse mb-2"></div>
              <div className="h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-md w-24 animate-pulse"></div>
            </div>
            <div className="pt-4">
              <div className="h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-md w-20 animate-pulse"></div>
            </div>
          </div>
        )}
      </div>

      {/* 右侧内容 */}
      <div className="web3-card p-6 animate-fade-in-up">
        <div className="h-6 bg-gradient-to-r from-gray-600 to-gray-700 rounded w-20 animate-pulse mb-4"></div>
        {rightChildren || (
          <div className="space-y-4">
            {Array.from({ length: itemCount }).map((_, i) => (
              <div
                key={i}
                className="p-4 border border-gray-600 rounded-lg bg-gray-800/20"
              >
                <SkeletonLoader />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
