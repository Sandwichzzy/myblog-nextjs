import type { Metadata } from "next";
import "./globals.css";
import { MainLayout } from "@/components";
import { AuthProvider } from "@/contexts/AuthContext";

// 站点URL（SEO元数据使用）
const SITE_URL = "https://myblog-nextjs-jade.vercel.app";

export const metadata: Metadata = {
  title: {
    default: "我的博客",
    template: "%s - 我的博客",
  },
  description: "分享技术思考与生活感悟，记录成长的每一步",
  keywords: ["博客", "技术", "编程", "Web开发", "Next.js"],
  authors: [{ name: "我的博客" }],
  creator: "我的博客",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: SITE_URL,
    siteName: "我的博客",
    title: "我的博客",
    description: "分享技术思考与生活感悟，记录成长的每一步",
  },
  twitter: {
    card: "summary_large_image",
    title: "我的博客",
    description: "分享技术思考与生活感悟，记录成长的每一步",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <AuthProvider>
          <MainLayout>{children}</MainLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
