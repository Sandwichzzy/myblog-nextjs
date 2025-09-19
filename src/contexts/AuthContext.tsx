"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContextType, AuthUser } from "@/types/database";
import {
  getCurrentUser,
  signOut as authSignOut,
  onAuthStateChange,
  isUserAdmin,
} from "@/lib/auth";

import type { Provider } from "@supabase/supabase-js";

// 创建认证Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Context Provider组件
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // 登录函数
  const signIn = async (provider: Provider) => {
    try {
      // 调用服务端 API 进行 OAuth 登录
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ provider }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "登录失败");
      }

      // 重定向到 OAuth 提供商
      window.location.href = data.url;
    } catch (error) {
      console.error("登录失败:", error);
      throw error;
    }
  };

  // 登出函数
  const signOut = async () => {
    try {
      // 1. 立即清理状态，提供更好的用户体验
      setUser(null);
      setIsAdmin(false);

      // 2. 调用实际的登出函数
      await authSignOut();

      // 3. 强制刷新页面以确保完全清理状态
      if (typeof window !== "undefined") {
        // 使用setTimeout确保状态更新完成
        setTimeout(() => {
          window.location.href = "/";
        }, 100);
      }
    } catch (error) {
      console.error("登出失败:", error);
      // 即使登出失败，也要清理本地状态
      setUser(null);
      setIsAdmin(false);
      throw error;
    }
  };

  // 刷新用户配置
  const refreshProfile = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        const adminStatus = await isUserAdmin(currentUser.id);
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("刷新用户信息失败:", error);
    }
  };

  // 初始化和监听认证状态变化
  useEffect(() => {
    let mounted = true;
    let hasInitialized = false;

    // 完成初始化的函数
    const completeInitialization = (authUser: AuthUser | null) => {
      if (!mounted || hasInitialized) return;

      hasInitialized = true;
      setUser(authUser);
      setIsLoading(false);
      console.log(
        "认证状态初始化完成:",
        authUser ? `用户 ${authUser.email}` : "未登录"
      );
    };

    // 处理用户状态更新
    const updateUserState = async (authUser: AuthUser | null) => {
      if (!mounted) return;

      if (authUser) {
        try {
          const adminStatus = await isUserAdmin(authUser.id);
          if (mounted) {
            setIsAdmin(adminStatus);
            console.log("管理员状态:", adminStatus);
          }
        } catch (error) {
          console.error("检查管理员状态失败:", error);
          if (mounted) {
            setIsAdmin(false);
          }
        }
      } else {
        if (mounted) {
          setIsAdmin(false);
        }
      }
    };

    // 监听认证状态变化
    const {
      data: { subscription },
    } = onAuthStateChange(async (authUser) => {
      if (!mounted) return;

      console.log(
        "认证状态变化:",
        authUser ? `已登录 (${authUser.email})` : "未登录"
      );

      // 如果还没有初始化，这是初始化过程
      if (!hasInitialized) {
        completeInitialization(authUser);
        await updateUserState(authUser);
      } else {
        // 如果已经初始化，这是状态变化
        setUser(authUser);
        await updateUserState(authUser);
      }
    });

    // 设置超时保护 - 如果30秒内没有初始化完成，强制结束加载
    const timeoutId = setTimeout(() => {
      if (!hasInitialized && mounted) {
        console.warn("认证状态初始化超时，强制结束加载状态");
        console.warn("可能原因:");
        console.warn("1. 网络连接问题");
        console.warn("2. Supabase配置错误");
        console.warn("3. localStorage中的token已过期");
        hasInitialized = true;
        setIsLoading(false);
      }
    }, 30000); // 30秒超时

    // 清理函数
    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription?.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAdmin,
    signIn,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 自定义Hook，用于在组件中使用认证状态
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

// 便捷Hook：检查是否已登录
export function useUser() {
  const { user, isLoading } = useAuth();
  return { user, isLoading, isLoggedIn: !!user };
}

// 便捷Hook：检查管理员权限
export function useAdmin() {
  const { user, isAdmin, isLoading } = useAuth();
  return {
    user,
    isAdmin,
    isLoading,
    isLoggedIn: !!user,
    canAccessAdmin: isAdmin && !!user,
  };
}
