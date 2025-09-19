import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { ArticleForDisplay } from "@/types/database";

interface ArticleCardProps {
  article: ArticleForDisplay;
}

export default function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="web3-card group cursor-pointer overflow-hidden">
      {/* 文章封面 */}
      <div className="h-48 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 relative overflow-hidden">
        {/* 动态背景效果 */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
        <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full animate-pulse"></div>
        <div
          className="absolute bottom-4 left-4 w-6 h-6 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        {/* 中央图标 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 animate-glow">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
        </div>

        {/* 悬浮效果 */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* 文章内容 */}
      <div className="p-6">
        {/* 标签 */}
        {article.tags && article.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {article.tags.slice(0, 3).map((tagItem) => (
              <Link
                key={tagItem.tag.id}
                href={`/articles?tag=${tagItem.tag.name}`}
                className="web3-tag text-xs hover:scale-105 transition-transform"
                style={{
                  backgroundColor: `${tagItem.tag.color}20`,
                  borderColor: `${tagItem.tag.color}40`,
                  color: tagItem.tag.color,
                }}
              >
                #{tagItem.tag.name}
              </Link>
            ))}
            {article.tags.length > 3 && (
              <span className="web3-tag text-xs bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-400 border-gray-500/40">
                +{article.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* 文章标题 */}
        <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition-all duration-300">
          <Link href={`/articles/${article.slug}`}>{article.title}</Link>
        </h3>

        {/* 文章摘要 */}
        <p className="text-gray-400 mb-4 line-clamp-3 leading-relaxed group-hover:text-gray-300 transition-colors">
          {article.excerpt || "探索更多精彩内容..."}
        </p>

        {/* 文章元信息 */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4 text-gray-500">
            <span className="flex items-center group-hover:text-blue-400 transition-colors">
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
            <span className="flex items-center group-hover:text-purple-400 transition-colors">
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
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              {article.view_count}
            </span>
          </div>

          {/* 阅读更多链接 */}
          <Link
            href={`/articles/${article.slug}`}
            className="inline-flex items-center text-sm font-medium neon-text hover:animate-glow transition-all duration-300 group/link"
          >
            阅读更多
            <svg
              className="ml-1 w-4 h-4 group-hover/link:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>

      {/* 底部发光边框 */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </article>
  );
}
