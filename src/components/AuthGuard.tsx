"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  fallbackUrl?: string;
}

export default function AuthGuard({
  children,
  requireAuth = false,
  requireAdmin = false,
  fallbackUrl = "/auth/login",
}: AuthGuardProps) {
  const router = useRouter();
  const { user, isAdmin, isLoading } = useAuth();

  useEffect(() => {
    // 等待认证状态加载完成
    if (isLoading) return;

    // 需要登录但用户未登录
    if (requireAuth && !user) {
      const currentPath = window.location.pathname;
      const redirectUrl = `${fallbackUrl}?redirectTo=${encodeURIComponent(
        currentPath
      )}`;
      router.push(redirectUrl);
      return;
    }

    // 需要管理员权限但用户不是管理员
    if (requireAdmin && (!user || !isAdmin)) {
      if (!user) {
        // 未登录，重定向到登录页
        const currentPath = window.location.pathname;
        const redirectUrl = `${fallbackUrl}?redirectTo=${encodeURIComponent(
          currentPath
        )}`;
        router.push(redirectUrl);
      } else {
        // 已登录但不是管理员，重定向到首页
        router.push("/");
      }
      return;
    }
  }, [
    user,
    isAdmin,
    isLoading,
    requireAuth,
    requireAdmin,
    router,
    fallbackUrl,
  ]);

  // 加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">验证登录状态...</p>
        </div>
      </div>
    );
  }

  // 需要登录但用户未登录
  if (requireAuth && !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">需要登录</h2>
          <p className="mt-2 text-gray-600">您需要登录后才能访问此页面</p>
          <p className="mt-4 text-sm text-gray-500">正在重定向到登录页面...</p>
        </div>
      </div>
    );
  }

  // 需要管理员权限但用户不是管理员
  if (requireAdmin && (!user || !isAdmin)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
              />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">权限不足</h2>
          <p className="mt-2 text-gray-600">您需要管理员权限才能访问此页面</p>
          <p className="mt-4 text-sm text-gray-500">正在重定向...</p>
        </div>
      </div>
    );
  }

  // 权限验证通过，渲染子组件
  return <>{children}</>;
}
