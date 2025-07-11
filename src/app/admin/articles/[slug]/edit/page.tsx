import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getArticleBySlug } from "@/lib/articles";
import { ArticleForm } from "@/components";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditArticlePage({ params }: PageProps) {
  const { slug } = await params;

  // 获取文章数据
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">编辑文章</h1>
          <p className="mt-2 text-gray-600">
            编辑文章: <span className="font-medium">{article.title}</span>
          </p>
        </div>

        {/* 文章表单 */}
        <Suspense
          fallback={
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="animate-pulse space-y-6">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          }
        >
          <ArticleForm article={article} mode="edit" />
        </Suspense>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  return {
    title: `编辑文章: ${article?.title || "未找到"} - 我的博客管理后台`,
    description: `编辑文章: ${article?.title || ""}`,
  };
}
