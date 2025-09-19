import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import { formatDate, calculateReadingTime } from "@/lib/utils";
import { getArticleBySlug, incrementViewCount } from "@/lib/articles";
import { getArticleComments } from "@/lib/comments";
import { ArticleComments } from "@/components";
import {
  BreadcrumbLink,
  TagButton,
  FooterButtons,
} from "./ArticleInteractions";
import Image from "next/image";

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

  // 站点URL（SEO元数据使用）
  const SITE_URL = "https://myblog-nextjs-jade.vercel.app";

  // JSON-LD 结构化数据
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || article.content.slice(0, 120),
    datePublished: article.created_at,
    dateModified: article.updated_at,
    author: {
      "@type": "Person",
      name: article.author_id || "未知作者",
    },
    publisher: {
      "@type": "Organization",
      name: "我的博客",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE_URL}/articles/${article.slug}`,
    },
    keywords:
      article.tags
        ?.map((t) => t.tag?.name)
        .filter(Boolean)
        .join(", ") || undefined,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* 背景装饰效果 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* 注入 JSON-LD 结构化数据 */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 文章头部 */}
        <header className="mb-8">
          {/* 面包屑导航 */}
          <nav className="flex items-center space-x-2 text-sm text-gray-300 mb-6">
            <BreadcrumbLink href="/">首页</BreadcrumbLink>
            <span>/</span>
            <BreadcrumbLink href="/articles">文章</BreadcrumbLink>
            <span>/</span>
            <span className="text-white">{article.title}</span>
          </nav>

          {/* 文章标题 */}
          <h1 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight">
            <span className="gradient-text">{article.title}</span>
          </h1>

          {/* 文章元信息 */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-6">
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4 text-blue-400"
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
                className="w-4 h-4 text-purple-400"
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
              <span>
                <span className="neon-text font-semibold">
                  {article.view_count}
                </span>{" "}
                次浏览
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4 text-pink-400"
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
              <span>
                约{" "}
                <span className="neon-text font-semibold">
                  {calculateReadingTime(article.content)}
                </span>{" "}
                分钟阅读
              </span>
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
        <div className="web3-card overflow-hidden mb-8">
          <div className="p-8 lg:p-12">
            <div
              className="prose prose-xl max-w-none 
              prose-headings:text-gray-100 prose-headings:font-bold
              prose-p:text-gray-200 prose-p:leading-relaxed prose-p:mb-4 
              prose-a:text-blue-400 prose-a:no-underline hover:prose-a:text-blue-300 hover:prose-a:underline 
              prose-strong:text-white prose-strong:font-semibold
              prose-blockquote:text-gray-300 prose-blockquote:border-blue-400 prose-blockquote:bg-blue-900/20 prose-blockquote:rounded-r
              prose-li:text-gray-200 prose-li:my-1
              prose-code:text-pink-400 prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:border prose-pre:border-gray-700
              prose-th:text-gray-100 prose-th:bg-gray-800 prose-th:border-gray-600
              prose-td:text-gray-200 prose-td:border-gray-600
              prose-hr:border-gray-600
              prose-ul:text-gray-200 prose-ul:list-disc prose-ul:pl-6
              prose-ol:text-gray-200 prose-ol:list-decimal prose-ol:pl-6
              [&_li]:relative [&_li]:pl-0 [&_li::marker]:text-gray-400 [&_li::marker]:font-normal"
              style={{
                listStylePosition: "outside",
              }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeRaw, rehypeKatex]}
                components={{
                  // 自定义图片渲染
                  img: ({ src, alt, ...props }) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { width, height, ...restProps } = props;
                    const imageSrc = src as string;

                    // 验证URL是否有效
                    const isValidUrl = (url: string) => {
                      try {
                        new URL(url);
                        return true;
                      } catch {
                        // 检查是否是相对路径
                        return (
                          url.startsWith("/") ||
                          url.startsWith("./") ||
                          url.startsWith("../")
                        );
                      }
                    };

                    // 如果没有src或src为空，直接返回错误提示
                    if (!imageSrc || imageSrc.trim() === "") {
                      return (
                        <span className="block my-6 p-4 bg-gray-100 rounded-lg text-center text-gray-500">
                          <span className="block">图片路径为空</span>
                          {alt && (
                            <span className="block text-sm mt-1 italic">
                              {alt}
                            </span>
                          )}
                        </span>
                      );
                    }

                    if (!isValidUrl(imageSrc)) {
                      return (
                        <span className="block my-6 p-4 bg-gray-100 rounded-lg text-center text-gray-500">
                          <span className="block">
                            图片加载失败: {imageSrc}
                          </span>
                          {alt && (
                            <span className="block text-sm mt-1 italic">
                              {alt}
                            </span>
                          )}
                        </span>
                      );
                    }

                    return (
                      <span className="block my-6">
                        <Image
                          src={imageSrc}
                          alt={(alt as string) || ""}
                          width={800}
                          height={400}
                          className="rounded-lg shadow-md w-full h-auto"
                          {...restProps}
                        />
                        {alt && (
                          <span className="block text-sm text-gray-400 text-center mt-2 italic">
                            {alt}
                          </span>
                        )}
                      </span>
                    );
                  },
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
                        PreTag="pre"
                        className="rounded-lg my-4"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code
                        className="bg-gray-800 text-pink-400 px-1 py-0.5 rounded text-sm"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  // 自定义标题渲染
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold text-gray-100 mb-6 mt-8 border-b border-gray-600 pb-2">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-bold text-gray-100 mb-4 mt-6">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-bold text-gray-100 mb-3 mt-4">
                      {children}
                    </h3>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside text-gray-200 mb-4 space-y-1">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside text-gray-200 mb-4 space-y-1">
                      {children}
                    </ol>
                  ),
                  // 自定义引用渲染
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-400 bg-blue-900/20 p-4 my-4 italic text-gray-300 rounded-r">
                      {children}
                    </blockquote>
                  ),
                  // 自定义链接渲染
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
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
                      <table className="min-w-full border-collapse border border-gray-600">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-gray-600 bg-gray-800 px-4 py-2 text-left font-medium text-gray-100">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-gray-600 px-4 py-2 text-gray-200">
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
        <footer className="border-t border-gray-600 pt-8 mb-12">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-300">
              最后更新:{" "}
              <span className="neon-text">
                {formatDate(article.updated_at)}
              </span>
            </div>
            <FooterButtons />
          </div>
        </footer>

        {/* 评论区域 */}
        <section className="border-t border-gray-600 pt-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              <span className="gradient-text">评论区</span>
            </h2>
          </div>
          <ArticleComments
            articleId={article.id}
            initialComments={initialComments}
          />
        </section>
      </article>
    </div>
  );
}
