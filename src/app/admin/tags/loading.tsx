import {
  AdminPageSkeleton,
  TwoColumnSkeleton,
  PageLoadingIndicator,
} from "@/components";

export default function TagsLoading() {
  return (
    <AdminPageSkeleton title={true}>
      <TwoColumnSkeleton itemCount={8} />
      <PageLoadingIndicator message="正在加载标签管理..." color="purple" />
    </AdminPageSkeleton>
  );
}
