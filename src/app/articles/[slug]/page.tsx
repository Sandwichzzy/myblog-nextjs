import React from "react";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import { formatDate, calculateReadingTime } from "@/lib/utils";
import { getArticleBySlug } from "@/lib/articles";
import { getArticleComments } from "@/lib/comments";
import { ArticleComments } from "@/components";
import {
  BreadcrumbLink,
  TagButton,
  FooterButtons,
} from "./ArticleInteractions";
import Image from "next/image";
import { TableOfContents } from "@/components/Article/TableOfContents";
import { HeadingIdCounter } from "@/lib/heading-utils";

// ============================================================================
// ISR 配置：文章详情页使用增量静态再生，优化加载性能
// ============================================================================
// 生产环境：3600秒（1小时）重新验证
// 注意：Next.js 要求 revalidate 必须是静态字面量数字，不能使用变量或对象属性
// 对应 ISR_REVALIDATE.ARTICLE 的生产环境值
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

  // 创建标题 ID 计数器，确保重复标题有唯一 ID
  const headingIdCounter = new HeadingIdCounter();

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
            {/* Git 仓库链接 */}
            {article.git_repo_url && (
              <div className="flex items-center space-x-2">
                <svg
                  className="w-4 h-4 text-green-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
                <a
                  href={article.git_repo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 transition-colors underline"
                >
                  查看源码
                </a>
              </div>
            )}
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

        {/* 主内容区域：左侧目录 + 右侧文章内容 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* 左侧目录 - 仅在大屏幕显示 */}
          <aside className="hidden lg:block lg:col-span-3">
            <TableOfContents content={article.content} />
          </aside>

          {/* 右侧文章内容 */}
          <div className="lg:col-span-9">
            <div className="web3-card overflow-hidden">
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
                      // 自定义段落渲染 - 防止代码块被包裹在 p 标签中
                      p: ({ children, ...props }) => {
                        // 检查子元素是否包含 pre 标签（代码块）
                        const hasCodeBlock = React.Children.toArray(children).some(
                          (child) => {
                            if (!React.isValidElement(child)) return false;
                            // 检查是否是 pre 标签或包含语言类名的代码块
                            return (
                              child.type === "pre" ||
                              (typeof child.props === "object" &&
                                child.props !== null &&
                                "className" in child.props &&
                                typeof child.props.className === "string" &&
                                child.props.className.includes("language-"))
                            );
                          }
                        );

                        // 如果包含代码块，使用 div 而不是 p
                        if (hasCodeBlock) {
                          return <div {...props}>{children}</div>;
                        }

                        return <p {...props}>{children}</p>;
                      },
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
                  // 自定义标题渲染 - 添加 ID 以支持目录锚点
                  h1: ({ children }) => {
                    const id = headingIdCounter.getUniqueId(String(children));
                    return (
                      <h1
                        id={id}
                        className="text-3xl font-bold text-gray-100 mb-6 mt-8 border-b border-gray-600 pb-2 scroll-mt-24"
                      >
                        {children}
                      </h1>
                    );
                  },
                  h2: ({ children }) => {
                    const id = headingIdCounter.getUniqueId(String(children));
                    return (
                      <h2
                        id={id}
                        className="text-2xl font-bold text-gray-100 mb-4 mt-6 scroll-mt-24"
                      >
                        {children}
                      </h2>
                    );
                  },
                  h3: ({ children }) => {
                    const id = headingIdCounter.getUniqueId(String(children));
                    return (
                      <h3
                        id={id}
                        className="text-xl font-bold text-gray-100 mb-3 mt-4 scroll-mt-24"
                      >
                        {children}
                      </h3>
                    );
                  },
                  h4: ({ children }) => {
                    const id = headingIdCounter.getUniqueId(String(children));
                    return (
                      <h4
                        id={id}
                        className="text-lg font-bold text-gray-100 mb-2 mt-3 scroll-mt-24"
                      >
                        {children}
                      </h4>
                    );
                  },
                  h5: ({ children }) => {
                    const id = headingIdCounter.getUniqueId(String(children));
                    return (
                      <h5
                        id={id}
                        className="text-base font-bold text-gray-100 mb-2 mt-3 scroll-mt-24"
                      >
                        {children}
                      </h5>
                    );
                  },
                  h6: ({ children }) => {
                    const id = headingIdCounter.getUniqueId(String(children));
                    return (
                      <h6
                        id={id}
                        className="text-sm font-bold text-gray-100 mb-2 mt-3 scroll-mt-24"
                      >
                        {children}
                      </h6>
                    );
                  },
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
