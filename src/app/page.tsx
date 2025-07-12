import Image from "next/image";
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
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              欢迎来到我的博客
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              分享技术思考与生活感悟，记录成长的每一步
            </p>
            <div className="space-x-4">
              <Link
                href="/articles"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
              >
                阅读文章
              </Link>
              <Link
                href="/about"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-block"
              >
                关于我
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Articles Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              最新文章
            </h2>
            <p className="text-lg text-gray-600">
              最近发布的技术文章和思考分享
            </p>
          </div>

          {/* 文章列表 */}
          {latestArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {latestArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                暂无文章
              </h3>
              <p className="text-gray-600 mb-6">
                还没有发布任何文章，敬请期待！
              </p>
              <Link
                href="/admin/articles/new"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
              >
                创建第一篇文章
              </Link>
            </div>
          )}

          {/* 查看更多按钮 */}
          {latestArticles.length > 0 && (
            <div className="text-center mt-12">
              <Link
                href="/articles"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
              >
                查看更多文章
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
