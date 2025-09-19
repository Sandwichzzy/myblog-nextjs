import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-t from-gray-900 via-gray-800 to-transparent border-t border-blue-500/20">
      {/* 背景装饰 */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-500/5 via-purple-500/5 to-transparent"></div>
      <div className="absolute top-0 left-1/4 w-32 h-32 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-0 right-1/4 w-24 h-24 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 网站信息 */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">
              <span className="gradient-text">⚡ Web3 博客</span>
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-md">
              探索去中心化未来，分享区块链技术与DApp开发的前沿见解。
              构建更加开放、透明和去中心化的数字世界。
            </p>

            {/* 技术栈标签 */}
            <div className="flex flex-wrap gap-2 mb-6">
              {["Next.js 15", "TypeScript", "Supabase", "Web3"].map((tech) => (
                <span key={tech} className="web3-tag text-xs">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* 快速链接 */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 relative">
              <span className="neon-text-purple">快速导航</span>
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-gray-400 hover:text-white hover:neon-text transition-all duration-300 text-sm flex items-center group"
                >
                  <svg
                    className="w-4 h-4 mr-2 group-hover:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  首页
                </Link>
              </li>
              <li>
                <Link
                  href="/articles"
                  className="text-gray-400 hover:text-white hover:neon-text transition-all duration-300 text-sm flex items-center group"
                >
                  <svg
                    className="w-4 h-4 mr-2 group-hover:text-purple-400"
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
                  技术文章
                </Link>
              </li>
            </ul>
          </div>

          {/* 社交链接 */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-6 relative">
              <span className="neon-text-blue">联系方式</span>
              <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
            </h3>
            <div className="flex space-x-4">
              <a
                href="https://github.com/Sandwichzzy"
                className="w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg flex items-center justify-center text-gray-400 hover:from-blue-500 hover:to-blue-600 hover:text-white transition-all duration-300 group hover:scale-110"
                aria-label="GitHub"
              >
                <svg
                  className="h-5 w-5 group-hover:animate-pulse"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg flex items-center justify-center text-gray-400 hover:from-pink-500 hover:to-pink-600 hover:text-white transition-all duration-300 group hover:scale-110"
                aria-label="Discord"
              >
                <svg
                  className="h-5 w-5 group-hover:animate-pulse"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.010c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* 分割线 */}
        <div className="mt-12 pt-8 border-t border-gradient-to-r from-transparent via-blue-500/30 to-transparent">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* 版权信息 */}
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-gray-400 text-sm">
                © {currentYear}
                <span className="neon-text mx-2">Web3 博客</span>
                保留所有权利
              </p>
              <p className="text-gray-500 text-xs mt-1">
                基于开源技术构建 · 拥抱去中心化未来
              </p>
            </div>

            {/* 技术标识 */}
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center">
                Powered by{" "}
                <a
                  href="https://nextjs.org"
                  className="neon-text-blue hover:animate-glow ml-1 transition-all"
                >
                  Next.js
                </a>
              </span>
              <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
              <span className="flex items-center">
                Database by{" "}
                <a
                  href="https://supabase.com"
                  className="neon-text-green hover:animate-glow ml-1 transition-all"
                >
                  Supabase
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 底部发光效果 */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
    </footer>
  );
}
