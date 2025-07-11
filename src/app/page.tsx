import Image from "next/image";

export default function Home() {
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
              <a
                href="/articles"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
              >
                阅读文章
              </a>
              <a
                href="/about"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-block"
              >
                关于我
              </a>
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

          {/* 文章列表占位符 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">文章封面</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    文章标题 {item}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    这里是文章的摘要内容，简要介绍文章的主要内容和观点...
                  </p>
                  <div className="flex items-center text-sm text-gray-500">
                    <span>2024-01-01</span>
                    <span className="mx-2">•</span>
                    <span>阅读时间: 5 分钟</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="/articles"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
            >
              查看更多文章
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
