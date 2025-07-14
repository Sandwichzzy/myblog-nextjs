import {
  AdminPageSkeleton,
  TableSkeleton,
  PaginationSkeleton,
  PageLoadingIndicator,
} from "@/components";

export default function ArticlesLoading() {
  const columns = ["文章", "状态", "浏览量", "创建时间", "操作"];

  return (
    <AdminPageSkeleton title={true} stats={3} actionButton={true}>
      <TableSkeleton columns={columns} rows={8} />
      <PaginationSkeleton />
      <PageLoadingIndicator message="正在加载文章列表..." color="blue" />
    </AdminPageSkeleton>
  );
}
