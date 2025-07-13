"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContextType, AuthUser } from "@/types/database";
import {
  getCurrentUser,
  signInWithProvider,
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
      await signInWithProvider(provider);
      // OAuth重定向，无需在此处理用户状态
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

    // 初始化用户状态
    const initializeAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (mounted) {
          setUser(currentUser);

          if (currentUser) {
            const adminStatus = await isUserAdmin(currentUser.id);
            setIsAdmin(adminStatus);
          }
        }
      } catch (error) {
        console.error("初始化认证状态失败:", error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // 监听认证状态变化
    const {
      data: { subscription },
    } = onAuthStateChange(async (authUser) => {
      if (mounted) {
        setUser(authUser);

        if (authUser) {
          const adminStatus = await isUserAdmin(authUser.id);
          setIsAdmin(adminStatus);
        } else {
          setIsAdmin(false);
        }

        setIsLoading(false);
      }
    });

    initializeAuth();

    // 清理函数
    return () => {
      mounted = false;
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
