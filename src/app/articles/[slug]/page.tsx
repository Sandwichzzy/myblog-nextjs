"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  formatDate,
  formatRelativeTime,
  calculateReadingTime,
} from "@/lib/utils";
import { ArticleForDisplay } from "@/types/database";

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [article, setArticle] = useState<ArticleForDisplay | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const slug = params.slug as string;

  useEffect(() => {
    if (!slug) return;

    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/articles/${slug}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "获取文章失败");
        }

        if (data.success) {
          setArticle(data.data);
        } else {
          throw new Error(data.message || "获取文章失败");
        }
      } catch (error) {
        console.error("获取文章失败:", error);
        setError(error instanceof Error ? error.message : "获取文章失败");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (loading) {
    return <ArticleDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              获取文章失败
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-x-4">
              <button
                onClick={() => router.back()}
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                返回上一页
              </button>
              <button
                onClick={() => router.push("/articles")}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                浏览所有文章
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              文章不存在
            </h1>
            <p className="text-gray-600 mb-6">
              抱歉，您要查看的文章不存在或已被删除。
            </p>
            <button
              onClick={() => router.push("/articles")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              浏览所有文章
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 文章头部 */}
        <header className="mb-8">
          {/* 面包屑导航 */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
            <button
              onClick={() => router.push("/")}
              className="hover:text-blue-600 transition-colors"
            >
              首页
            </button>
            <span>/</span>
            <button
              onClick={() => router.push("/articles")}
              className="hover:text-blue-600 transition-colors"
            >
              文章
            </button>
            <span>/</span>
            <span className="text-gray-900">{article.title}</span>
          </nav>

          {/* 文章标题 */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {article.title}
          </h1>

          {/* 文章元信息 */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>发布于 {formatDate(article.created_at)}</span>
            </div>

            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <span>{article.view_count} 次浏览</span>
            </div>

            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>约 {calculateReadingTime(article.content)} 分钟阅读</span>
            </div>
          </div>

          {/* 文章标签 */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {article.tags.map(
                (tagItem: {
                  tag: { id: string; name: string; color: string };
                }) => (
                  <button
                    key={tagItem.tag.id}
                    onClick={() =>
                      router.push(`/articles?tag=${tagItem.tag.name}`)
                    }
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium hover:opacity-80 transition-opacity"
                    style={{
                      backgroundColor: tagItem.tag.color + "20",
                      color: tagItem.tag.color,
                      borderColor: tagItem.tag.color + "40",
                    }}
                  >
                    #{tagItem.tag.name}
                  </button>
                )
              )}
            </div>
          )}
        </header>

        {/* 文章内容 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-8">
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{
                __html: formatMarkdownToHtml(article.content),
              }}
            />
          </div>
        </div>

        {/* 文章底部信息 */}
        <footer className="border-t border-gray-200 pt-8">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              最后更新: {formatRelativeTime(article.updated_at)}
            </div>
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
          </div>
        </footer>
      </article>
    </div>
  );
}

// 骨架屏组件
function ArticleDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          {/* 面包屑骨架 */}
          <div className="flex items-center space-x-2 mb-6">
            <div className="h-4 bg-gray-200 rounded w-12"></div>
            <div className="h-4 bg-gray-200 rounded w-4"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-4"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>

          {/* 标题骨架 */}
          <div className="h-10 bg-gray-200 rounded mb-6"></div>

          {/* 元信息骨架 */}
          <div className="flex items-center space-x-6 mb-6">
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>

          {/* 标签骨架 */}
          <div className="flex space-x-2 mb-8">
            <div className="h-6 bg-gray-200 rounded-full w-16"></div>
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
            <div className="h-6 bg-gray-200 rounded-full w-12"></div>
          </div>

          {/* 内容骨架 */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 简单的Markdown转HTML函数
function formatMarkdownToHtml(markdown: string): string {
  return markdown
    .replace(/\r\n/g, "\n")
    .replace(/\n/g, "<br>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(
      /`(.*?)`/g,
      '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>'
    )
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-4 mt-8">$1</h1>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mb-3 mt-6">$1</h2>')
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold mb-2 mt-4">$1</h3>')
    .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
    .replace(/(<li[\s\S]*?<\/li>)/g, '<ul class="space-y-1 mb-4">$1</ul>');
}
