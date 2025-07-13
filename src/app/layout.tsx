import type { Metadata } from "next";
import "./globals.css";
import { MainLayout } from "@/components";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: {
    default: "我的博客",
    template: "%s - 我的博客",
  },
  description: "分享技术思考与生活感悟，记录成长的每一步",
  keywords: ["博客", "技术", "编程", "Web开发", "Next.js"],
  authors: [{ name: "我的博客" }],
  creator: "我的博客",
  metadataBase: new URL("https://my-blog.com"),
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://my-blog.com",
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
