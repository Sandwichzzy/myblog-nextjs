"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Navigation() {
  const router = useRouter();
  const { user, isAdmin, signOut, isLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  // 处理登出
  const handleSignOut = async () => {
    try {
      setIsUserMenuOpen(false);
      await signOut();
      // signOut函数内部会处理重定向，无需在这里调用router.push
    } catch (error) {
      console.error("登出失败:", error);
      // 如果登出失败，尝试强制刷新页面
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  };

  // 点击外部关闭用户菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              我的博客
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {/* 导航链接 */}
            <div className="flex items-baseline space-x-8">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                首页
              </Link>
              <Link
                href="/articles"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                文章
              </Link>

              {/* 管理员链接 */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="text-purple-600 hover:text-purple-800 px-3 py-2 text-sm font-medium transition-colors"
                >
                  管理后台
                </Link>
              )}
            </div>

            {/* 用户区域 */}
            <div className="flex items-center space-x-4">
              {isLoading ? (
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
              ) : user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full"
                  >
                    {user.profile?.avatar_url ? (
                      <img
                        src={user.profile.avatar_url}
                        alt={user.profile.display_name || "用户头像"}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {(user.profile?.display_name ||
                          user.email ||
                          "U")[0].toUpperCase()}
                      </div>
                    )}
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
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* 用户下拉菜单 */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                      <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-200">
                        {user.profile?.display_name || user.email}
                        {isAdmin && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full">
                            管理员
                          </span>
                        )}
                      </div>

                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          管理后台
                        </Link>
                      )}

                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        退出登录
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  登录
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">打开主菜单</span>
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-b border-gray-200">
            {/* 导航链接 */}
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              首页
            </Link>
            <Link
              href="/articles"
              className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              文章
            </Link>
            <Link
              href="/tags"
              className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              标签
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              关于
            </Link>

            {/* 管理员链接 */}
            {isAdmin && (
              <Link
                href="/admin"
                className="text-purple-600 hover:text-purple-800 block px-3 py-2 text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                管理后台
              </Link>
            )}

            {/* 用户区域 */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              {isLoading ? (
                <div className="px-3 py-2 flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse mr-3"></div>
                  <span className="text-gray-500">加载中...</span>
                </div>
              ) : user ? (
                <div>
                  {/* 用户信息 */}
                  <div className="px-3 py-2 flex items-center">
                    {user.profile?.avatar_url ? (
                      <img
                        src={user.profile.avatar_url}
                        alt={user.profile.display_name || "用户头像"}
                        className="w-8 h-8 rounded-full mr-3"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                        {(user.profile?.display_name ||
                          user.email ||
                          "U")[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="text-base font-medium text-gray-900">
                        {user.profile?.display_name || user.email}
                      </div>
                      {isAdmin && (
                        <div className="text-xs text-purple-600">管理员</div>
                      )}
                    </div>
                  </div>

                  {/* 登出按钮 */}
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:text-red-800 hover:bg-red-50 transition-colors"
                  >
                    退出登录
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="bg-blue-600 text-white block px-3 py-2 text-base font-medium hover:bg-blue-700 transition-colors rounded-md mx-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  登录
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
