import { AuthGuard } from "@/components";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGuard requireAdmin={true}>{children}</AuthGuard>;
}

export const metadata = {
  title: {
    default: "管理后台 - 我的博客",
    template: "%s - 管理后台 - 我的博客",
  },
  description: "博客管理后台，管理文章、标签和评论",
  robots: {
    index: false,
    follow: false,
  },
};
