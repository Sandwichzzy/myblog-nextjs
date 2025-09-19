"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/contexts/AuthContext";

export default function Navigation() {
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
    <nav className="glass border-b border-blue-500/20 sticky top-0 z-50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 animate-slide-in-left">
            <Link
              href="/"
              className="text-2xl font-bold gradient-text hover:scale-105 transition-transform duration-300"
            >
              ⚡ Web3 博客
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {/* 导航链接 */}
            <div className="flex items-baseline space-x-8">
              <Link
                href="/"
                className="neon-text hover:animate-glow px-3 py-2 text-sm font-medium transition-all duration-300 relative group"
              >
                <span className="relative z-10">首页</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/20 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
              </Link>
              <Link
                href="/articles"
                className="text-gray-300 hover:neon-text hover:animate-glow px-3 py-2 text-sm font-medium transition-all duration-300 relative group"
              >
                <span className="relative z-10">文章</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
              </Link>

              {/* 管理员链接 */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="neon-text-purple hover:animate-glow px-3 py-2 text-sm font-medium transition-all duration-300 relative group"
                >
                  <span className="relative z-10 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                    控制台
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/30 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                </Link>
              )}
            </div>

            {/* 用户区域 */}
            <div className="flex items-center space-x-4">
              {isLoading ? (
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
              ) : user ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-gray-900 rounded-full p-1 transition-all duration-300 hover:bg-blue-500/10"
                  >
                    {user.profile?.avatar_url ? (
                      <div className="relative">
                        <Image
                          src={user.profile.avatar_url}
                          alt={user.profile.display_name || "用户头像"}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full border-2 border-blue-500/50 hover:border-blue-500 transition-colors"
                        />
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 hover:opacity-100 transition-opacity"></div>
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium animate-glow">
                        {(user.profile?.display_name ||
                          user.email ||
                          "U")[0].toUpperCase()}
                      </div>
                    )}
                    <svg
                      className="w-4 h-4 transition-transform duration-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      style={{
                        transform: isUserMenuOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                      }}
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
                    <div className="absolute right-0 mt-2 w-56 web3-card animate-fade-in-up z-50">
                      <div className="px-4 py-3 border-b border-blue-500/20">
                        <p className="text-sm text-gray-300">登录为</p>
                        <p className="text-base font-medium text-white truncate">
                          {user.profile?.display_name || user.email}
                        </p>
                        {isAdmin && (
                          <span className="inline-flex items-center mt-1 px-2 py-1 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            管理员
                          </span>
                        )}
                      </div>

                      <div className="py-1">
                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-blue-500/10 hover:text-white transition-colors group"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <svg
                              className="w-4 h-4 mr-3 group-hover:text-purple-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                            </svg>
                            控制台
                          </Link>
                        )}

                        <button
                          onClick={handleSignOut}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors group"
                        >
                          <svg
                            className="w-4 h-4 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          退出登录
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="web3-button text-sm font-medium"
                >
                  登陆
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-blue-500/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500/50 transition-all duration-300"
              aria-expanded="false"
            >
              <span className="sr-only">打开主菜单</span>
              <div className="relative w-6 h-6">
                <span
                  className={`absolute block w-6 h-0.5 bg-current transform transition-all duration-300 ${
                    isMenuOpen ? "rotate-45 top-3" : "top-1"
                  }`}
                ></span>
                <span
                  className={`absolute block w-6 h-0.5 bg-current transform transition-all duration-300 top-3 ${
                    isMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
                ></span>
                <span
                  className={`absolute block w-6 h-0.5 bg-current transform transition-all duration-300 ${
                    isMenuOpen ? "-rotate-45 top-3" : "top-5"
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden animate-fade-in-up">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 glass border-t border-blue-500/20">
            {/* 导航链接 */}
            <Link
              href="/"
              className="text-gray-300 hover:text-white hover:bg-blue-500/10 block px-3 py-2 text-base font-medium transition-all duration-300 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              首页
            </Link>
            <Link
              href="/articles"
              className="text-gray-300 hover:text-white hover:bg-purple-500/10 block px-3 py-2 text-base font-medium transition-all duration-300 rounded-lg"
              onClick={() => setIsMenuOpen(false)}
            >
              文章
            </Link>

            {/* 管理员链接 */}
            {isAdmin && (
              <Link
                href="/admin"
                className="neon-text-purple hover:bg-purple-500/20 block px-3 py-2 text-base font-medium transition-all duration-300 rounded-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="flex items-center">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                  控制台
                </span>
              </Link>
            )}

            {/* 用户区域 */}
            <div className="border-t border-blue-500/20 pt-4 mt-4">
              {isLoading ? (
                <div className="px-3 py-2 flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse mr-3"></div>
                  <span className="text-gray-400">连接中...</span>
                </div>
              ) : user ? (
                <div>
                  {/* 用户信息 */}
                  <div className="px-3 py-2 flex items-center">
                    {user.profile?.avatar_url ? (
                      <Image
                        src={user.profile.avatar_url}
                        alt={user.profile.display_name || "用户头像"}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full mr-3 border-2 border-blue-500/50"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3 animate-glow">
                        {(user.profile?.display_name ||
                          user.email ||
                          "U")[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="text-base font-medium text-white">
                        {user.profile?.display_name || user.email}
                      </div>
                      {isAdmin && (
                        <div className="text-xs neon-text-purple">管理员</div>
                      )}
                    </div>
                  </div>

                  {/* 登出按钮 */}
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors rounded-lg flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    断开连接
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="web3-button block text-center mx-3"
                  onClick={() => setIsMenuOpen(false)}
                >
                  连接钱包
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
