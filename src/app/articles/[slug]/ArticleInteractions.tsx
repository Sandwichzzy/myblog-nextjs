"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface BreadcrumbLinkProps {
  href: string;
  children: React.ReactNode;
}

interface TagButtonProps {
  tag: Tag;
}

// 面包屑导航链接
function BreadcrumbLink({ href, children }: BreadcrumbLinkProps) {
  return (
    <Link href={href} className="hover:text-blue-600 transition-colors">
      {children}
    </Link>
  );
}

// 标签按钮
function TagButton({ tag }: TagButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/articles?tag=${tag.name}`)}
      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium hover:opacity-80 transition-opacity"
      style={{
        backgroundColor: tag.color + "20",
        color: tag.color,
        borderColor: tag.color + "40",
      }}
    >
      #{tag.name}
    </button>
  );
}

// 底部按钮
function FooterButtons() {
  const router = useRouter();

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="text-blue-600 hover:text-blue-800 transition-colors"
      >
        回到顶部
      </button>
      <button
        onClick={() => router.push("/articles")}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        浏览更多文章
      </button>
    </div>
  );
}

// 导出各个组件
export { BreadcrumbLink, TagButton, FooterButtons };
