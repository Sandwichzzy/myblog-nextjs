import {
  AdminPageSkeleton,
  DashboardSkeleton,
  PageLoadingIndicator,
} from "@/components";

export default function AdminLoading() {
  return (
    <AdminPageSkeleton title={true} stats={4}>
      <DashboardSkeleton />
      <PageLoadingIndicator message="正在加载管理后台..." color="blue" />
    </AdminPageSkeleton>
  );
}
