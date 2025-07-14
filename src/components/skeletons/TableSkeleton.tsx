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
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: rows }).map((_, i) => (
              <TableRowSkeleton key={i} columns={columns.length} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
