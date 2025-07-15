import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { formatDate, calculateReadingTime } from "@/lib/utils";
import { getArticleBySlug, incrementViewCount } from "@/lib/articles";
import { getArticleComments } from "@/lib/comments";
import { ArticleComments } from "@/components";
import {
  BreadcrumbLink,
  TagButton,
  FooterButtons,
} from "./ArticleInteractions";

// 配置ISR - 文章详情页使用统一的配置
export const revalidate = 3600;

// 为最新的文章生成静态路径
export async function generateStaticParams() {
  try {
    const { getPublishedArticles } = await import("@/lib/articles");
    const result = await getPublishedArticles(1, 20); // 预生成最新20篇文章

    return result.articles.map((article) => ({
      slug: article.slug,
    }));
  } catch (error) {
    console.error("生成静态参数失败:", error);
    return [];
  }
}

// 为文章页面生成动态metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  try {
    const { getArticleBySlug } = await import("@/lib/articles");
    const article = await getArticleBySlug(slug);

    if (!article) {
      return {
        title: "文章不存在",
        description: "抱歉，您访问的文章不存在或已被删除。",
      };
    }

    return {
      title: article.title,
      description: article.excerpt || `阅读文章：${article.title}`,
      keywords: article.tags?.map((tag) => tag.tag?.name).filter(Boolean) || [],
      authors: [{ name: "我的博客" }],
      openGraph: {
        title: article.title,
        description: article.excerpt || `阅读文章：${article.title}`,
        type: "article",
        publishedTime: article.created_at,
        modifiedTime: article.updated_at,
        tags: article.tags?.map((tag) => tag.tag?.name).filter(Boolean) || [],
      },
      twitter: {
        card: "summary_large_image",
        title: article.title,
        description: article.excerpt || `阅读文章：${article.title}`,
      },
    };
  } catch (error) {
    console.error("生成文章metadata失败:", error);
    return {
      title: "文章加载失败",
      description: "文章加载时遇到问题，请稍后重试。",
    };
  }
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // 服务端直接获取文章数据
  const article = await getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  // 获取文章评论（服务端渲染）
  const commentsResult = await getArticleComments(article.id, 1, 10);
  const initialComments = commentsResult.comments;

  // 异步增加浏览量（不阻塞渲染）
  incrementViewCount(article.id).catch((error) => {
    console.error("增加浏览量失败:", error);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 文章头部 */}
        <header className="mb-8">
          {/* 面包屑导航 */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
            <BreadcrumbLink href="/">首页</BreadcrumbLink>
            <span>/</span>
            <BreadcrumbLink href="/articles">文章</BreadcrumbLink>
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
                  <TagButton key={tagItem.tag.id} tag={tagItem.tag} />
                )
              )}
            </div>
          )}
        </header>

        {/* 文章内容 */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-8">
            <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-blockquote:text-gray-600 prose-blockquote:border-blue-200 prose-li:text-gray-700 prose-pre:bg-gray-900 prose-pre:text-gray-100">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  // 自定义代码块渲染
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  code: ({ inline, className, children, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || "");
                    const language = match ? match[1] : "";

                    return !inline ? (
                      <SyntaxHighlighter
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        style={tomorrow as any}
                        language={language}
                        PreTag="div"
                        className="rounded-lg my-4"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code
                        className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  // 自定义标题渲染
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold text-gray-900 mb-6 mt-8 border-b border-gray-200 pb-2">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 mt-6">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-bold text-gray-900 mb-3 mt-4">
                      {children}
                    </h3>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-1">
                      {children}
                    </ol>
                  ),
                  // 自定义引用渲染
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-200 bg-blue-50 p-4 my-4 italic text-gray-600">
                      {children}
                    </blockquote>
                  ),
                  // 自定义链接渲染
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="text-blue-600 hover:text-blue-800 hover:underline"
                      target={href?.startsWith("http") ? "_blank" : undefined}
                      rel={
                        href?.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                    >
                      {children}
                    </a>
                  ),
                  // 自定义表格渲染
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-6">
                      <table className="min-w-full border-collapse border border-gray-300">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-gray-300 bg-gray-50 px-4 py-2 text-left font-medium text-gray-900">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-gray-300 px-4 py-2 text-gray-700">
                      {children}
                    </td>
                  ),
                }}
              >
                {article.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>

        {/* 文章底部信息 */}
        <footer className="border-t border-gray-200 pt-8 mb-12">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              最后更新: {formatDate(article.updated_at)}
            </div>
            <FooterButtons />
          </div>
        </footer>

        {/* 评论区域 */}
        <section className="border-t border-gray-200 pt-12">
          <ArticleComments
            articleId={article.id}
            initialComments={initialComments}
          />
        </section>
      </article>
    </div>
  );
}
