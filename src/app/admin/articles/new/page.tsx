import { Suspense } from "react";
import { ArticleForm } from "@/components";

export default function NewArticlePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">创建新文章</h1>
          <p className="mt-2 text-gray-600">撰写并发布新的博客文章</p>
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
          <ArticleForm />
        </Suspense>
      </div>
    </div>
  );
}

export const metadata = {
  title: "创建新文章 - 我的博客管理后台",
  description: "创建并发布新的博客文章",
};
