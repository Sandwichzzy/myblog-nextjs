import Link from "next/link";
import { ArticleCard } from "@/components";
import { getHomePageData } from "@/lib/isr-utils";

// 配置ISR - 首页使用统一的配置
export const revalidate = 600;

// 为首页生成动态metadata
export async function generateMetadata() {
  const { totalCount } = await getHomePageData();

  return {
    title: "Web3 博客 - 探索去中心化未来",
    description: `分享Web3技术、区块链见解和去中心化应用开发心得。已发布 ${totalCount} 篇技术文章。`,
    openGraph: {
      title: "Web3 博客 - 探索去中心化未来",
      description: `分享Web3技术、区块链见解和去中心化应用开发心得。已发布 ${totalCount} 篇技术文章。`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Web3 博客 - 探索去中心化未来",
      description: `分享Web3技术、区块链见解和去中心化应用开发心得。已发布 ${totalCount} 篇技术文章。`,
    },
  };
}

export default async function Home() {
  // 使用ISR优化的数据获取
  const { latestArticles, totalCount } = await getHomePageData();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* 背景动画元素 */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full animate-float"></div>
        <div
          className="absolute top-32 right-16 w-16 h-16 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full animate-float"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-20 left-1/4 w-12 h-12 bg-gradient-to-r from-pink-500/20 to-blue-500/20 rounded-full animate-float"
          style={{ animationDelay: "2s" }}
        ></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in-up">
            {/* 主标题 */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text animate-gradient">Web3</span>{" "}
              <span className="neon-text animate-glow">博客</span>
            </h1>

            {/* 副标题 */}
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              探索去中心化未来，分享
              <span className="neon-text-purple"> 区块链技术 </span>与
              <span className="neon-text-pink"> DApp开发 </span>
              的前沿见解
            </p>

            {/* 技术标签 */}
            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {[
                "Blockchain",
                "DeFi",
                "NFT",
                "Smart Contracts",
                "Web3",
                "DAO",
              ].map((tech, index) => (
                <span
                  key={tech}
                  className="web3-tag animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* CTA 按钮 */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/articles"
                className="web3-button inline-flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
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
                探索文章
              </Link>
              <Link
                href="#latest-articles"
                className="glass border border-blue-500/30 hover:border-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-500/10 transition-all duration-300 inline-flex items-center justify-center group"
              >
                <svg
                  className="w-5 h-5 mr-2 group-hover:animate-bounce"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
                了解更多
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Articles Section */}
      <section id="latest-articles" className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">最新</span>
              <span className="neon-text-purple"> 技术分享</span>
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              深入探讨Web3生态系统的最新发展和技术创新
              {totalCount > 0 && (
                <span className="block mt-2">
                  <span className="neon-text">已发布 {totalCount} 篇文章</span>
                  <span className="text-gray-500"> · 持续更新中</span>
                </span>
              )}
            </p>
          </div>

          {latestArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestArticles.map((article, index) => (
                <div
                  key={article.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ArticleCard article={article} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="web3-card max-w-md mx-auto p-8">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
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
                <h3 className="text-xl font-semibold text-white mb-2">
                  即将发布
                </h3>
                <p className="text-gray-400">
                  正在准备精彩的Web3技术内容，敬请期待！
                </p>
              </div>
            </div>
          )}

          {/* 查看所有文章按钮 */}
          <div className="text-center mt-16">
            <Link
              href="/articles"
              className="web3-button inline-flex items-center group"
            >
              查看所有文章
              <svg
                className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
