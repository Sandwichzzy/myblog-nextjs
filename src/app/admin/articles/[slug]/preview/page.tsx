import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { formatDate, calculateReadingTime } from "@/lib/utils";
import { getArticleBySlugAdmin } from "@/lib/articles";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePreviewPage({ params }: PageProps) {
  const { slug } = await params;

  // 使用管理员专用函数获取文章（包括草稿）
  const article = await getArticleBySlugAdmin(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 管理员预览提示 */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-blue-600"
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
              <span className="text-blue-700 font-medium">管理员预览模式</span>
              <span
                className={`px-2 py-1 text-xs rounded-full ${
                  article.published
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {article.published ? "已发布" : "草稿"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                href={`/admin/articles/${article.slug}/edit`}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                编辑文章
              </Link>
              <Link
                href="/admin/articles"
                className="text-gray-600 hover:text-gray-800 text-sm"
              >
                返回管理
              </Link>
            </div>
          </div>
        </div>

        <article>
          {/* 文章头部 */}
          <header className="mb-8">
            {/* 面包屑导航 */}
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
              <Link href="/admin" className="hover:text-gray-700">
                管理后台
              </Link>
              <span>/</span>
              <Link href="/admin/articles" className="hover:text-gray-700">
                文章管理
              </Link>
              <span>/</span>
              <span className="text-gray-900">预览</span>
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
                <span>创建于 {formatDate(article.created_at)}</span>
              </div>

              {article.updated_at !== article.created_at && (
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  <span>更新于 {formatDate(article.updated_at)}</span>
                </div>
              )}

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
                    <span
                      key={tagItem.tag.id}
                      className="px-3 py-1 text-sm rounded-full"
                      style={{
                        backgroundColor: tagItem.tag.color + "20",
                        color: tagItem.tag.color,
                        border: `1px solid ${tagItem.tag.color}40`,
                      }}
                    >
                      {tagItem.tag.name}
                    </span>
                  )
                )}
              </div>
            )}
          </header>

          {/* 文章内容 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
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
                  }}
                >
                  {article.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

export const metadata = {
  title: "文章预览 - 管理后台",
  description: "管理员文章预览页面",
};
