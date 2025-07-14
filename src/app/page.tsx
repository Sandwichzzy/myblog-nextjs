import Link from "next/link";
import { getPublishedArticles } from "@/lib/articles";
import ArticleCard from "@/components/ArticleCard";
import { ArticleForDisplay } from "@/types/database";

export default async function Home() {
  // 获取最新的三篇文章
  let latestArticles: ArticleForDisplay[] = [];
  try {
    const result = await getPublishedArticles(1, 3); // 获取第1页，3篇文章
    latestArticles = result.articles;
  } catch (error) {
    console.error("获取最新文章失败:", error);
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              我的个人博客
            </h1>
            <p className="mt-6 max-w-2xl mx-auto text-xl text-blue-100">
              分享技术见解、生活感悟和学习心得的个人空间
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <Link
                href="/articles"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                浏览文章
              </Link>
              <Link
                href="/articles"
                className="border border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
              >
                了解更多
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Articles Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">最新文章</h2>
            <p className="mt-4 text-lg text-gray-600">
              分享最新的技术见解和思考
            </p>
          </div>

          {latestArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">暂无文章</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/articles"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              查看所有文章
              <svg
                className="ml-2 -mr-1 w-5 h-5"
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
