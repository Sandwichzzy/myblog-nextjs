"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContextType, AuthUser } from "@/types/database";
import {
  getCurrentUser,
  signOut as authSignOut,
  onAuthStateChange,
  isUserAdmin,
} from "@/lib/auth";
import { supabase } from "@/lib/supabase";
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

    // 初始化完成函数
    const completeInitialization = () => {
      if (mounted && !hasInitialized) {
        hasInitialized = true;
        setIsLoading(false);
        console.log("认证状态初始化完成");
      }
    };

    // 监听认证状态变化
    const {
      data: { subscription },
    } = onAuthStateChange(async (authUser) => {
      if (!mounted) return;

      console.log("认证状态变化:", authUser ? "已登录" : "未登录");
      setUser(authUser);

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

      // 完成初始化
      completeInitialization();
    });

    // 等待 Supabase 会话恢复的初始化函数
    const initializeAuth = async (retryCount = 0) => {
      if (!mounted) return;

      console.log(`开始初始化认证状态... (尝试 ${retryCount + 1}/3)`);

      try {
        // 首先检查是否有存储的会话
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("获取会话失败:", sessionError);

          // 如果是网络错误且重试次数未达到上限，进行重试
          if (retryCount < 2 && sessionError.message.includes("network")) {
            console.log("网络错误，1秒后重试...");
            setTimeout(() => {
              if (mounted) initializeAuth(retryCount + 1);
            }, 1000);
            return;
          }
        }

        if (session) {
          console.log("发现存储的会话，尝试恢复用户状态");
          console.log("会话信息:", {
            expires_at: session.expires_at,
            user_id: session.user.id,
            email: session.user.email,
            role: session.user.role,
          });

          // 如果有会话，获取用户信息
          const currentUser = await getCurrentUser();
          if (mounted) {
            setUser(currentUser);

            if (currentUser) {
              try {
                const adminStatus = await isUserAdmin(currentUser.id);
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
            }
          }
        } else {
          console.log("没有找到存储的会话");
          if (mounted) {
            setUser(null);
            setIsAdmin(false);
          }
        }

        // 手动初始化完成（如果监听器没有触发）
        completeInitialization();
      } catch (error) {
        console.error("初始化认证状态失败:", error);

        // 如果是网络错误且重试次数未达到上限，进行重试
        if (
          retryCount < 2 &&
          error instanceof Error &&
          error.message.includes("network")
        ) {
          console.log("网络错误，1秒后重试...");
          setTimeout(() => {
            if (mounted) initializeAuth(retryCount + 1);
          }, 1000);
          return;
        }

        if (mounted) {
          setUser(null);
          setIsAdmin(false);
        }

        // 即使出错也要完成初始化
        completeInitialization();
      }
    };

    // 立即初始化
    initializeAuth();

    // 如果 3 秒后还没有初始化，强制结束加载状态
    const initTimeoutId = setTimeout(() => {
      if (!hasInitialized && mounted) {
        console.warn("认证状态初始化超时，强制结束加载状态");
        console.warn("可能的原因：网络问题、Supabase配置问题或认证服务异常");
        hasInitialized = true;
        setIsLoading(false);
      }
    }, 10000); // 减少到3秒

    // 清理函数
    return () => {
      mounted = false;
      clearTimeout(initTimeoutId);
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
