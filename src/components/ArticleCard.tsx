import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    created_at: string;
    view_count: number;
    tags: Array<{
      id: string;
      name: string;
      color: string;
    }>;
  };
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-200">
      {/* 文章封面占位符 */}
      <div className="h-48 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-4xl text-gray-300">📖</div>
      </div>

      {/* 文章内容 */}
      <div className="p-6">
        {/* 标签 */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {article.tags.slice(0, 3).map((tag) => (
              <Link
                key={tag.id}
                href={`/articles?tag=${tag.name}`}
                className="inline-block px-2 py-1 text-xs font-medium rounded-full transition-colors"
                style={{
                  backgroundColor: tag.color + "20",
                  color: tag.color,
                  border: `1px solid ${tag.color}40`,
                }}
              >
                {tag.name}
              </Link>
            ))}
            {article.tags.length > 3 && (
              <span className="inline-block px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full">
                +{article.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* 文章标题 */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
          <Link href={`/articles/${article.slug}`}>{article.title}</Link>
        </h3>

        {/* 文章摘要 */}
        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
          {article.excerpt}
        </p>

        {/* 文章元信息 */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
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
              {formatDate(article.created_at)}
            </span>
            <span className="flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  key="eye-inner"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  key="eye-outer"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {article.view_count} 次浏览
            </span>
          </div>

          {/* 阅读更多链接 */}
          <Link
            href={`/articles/${article.slug}`}
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            阅读更多 →
          </Link>
        </div>
      </div>
    </article>
  );
}
