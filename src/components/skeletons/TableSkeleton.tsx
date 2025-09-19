import { TableRowSkeleton } from "./LoadingSpinner";

interface TableSkeletonProps {
  columns: string[];
  rows?: number;
}

export default function TableSkeleton({
  columns,
  rows = 8,
}: TableSkeletonProps) {
  return (
    <div className="web3-card overflow-hidden animate-fade-in-up">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-600">
          <thead className="bg-gray-800/50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-600">
            {Array.from({ length: rows }).map((_, i) => (
              <TableRowSkeleton key={i} columns={columns.length} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
