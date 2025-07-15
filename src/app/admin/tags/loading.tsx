import { AdminPageSkeleton, PageLoadingIndicator } from "@/components";

export default function TagsLoading() {
  return (
    <AdminPageSkeleton title={true}>
      <PageLoadingIndicator message="正在加载标签管理..." color="purple" />
    </AdminPageSkeleton>
  );
}
