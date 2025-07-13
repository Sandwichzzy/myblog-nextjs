"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { promoteFirstUserToAdmin, ensureUserProfile } from "@/lib/auth";

interface AuthCallbackState {
  status: "loading" | "success" | "error";
  message: string;
}

function AuthCallbackPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<AuthCallbackState>({
    status: "loading",
    message: "处理登录信息...",
  });

  useEffect(() => {
    let mounted = true;

    const handleAuthCallback = async () => {
      try {
        // 检查URL错误参数
        const urlError = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        if (urlError) {
          throw new Error(errorDescription || `OAuth 错误: ${urlError}`);
        }

        // 等待认证会话
        const user = await waitForAuthSession();

        if (!mounted) return;

        // 处理认证成功
        await handleSuccessfulAuth(user);
      } catch (error) {
        if (!mounted) return;

        console.error("认证回调错误:", error);
        setState({
          status: "error",
          message:
            error instanceof Error ? error.message : "登录过程中发生错误",
        });

        // 3秒后重定向到登录页
        setTimeout(() => {
          if (mounted) {
            router.push("/auth/login");
          }
        }, 3000);
      }
    };

    // 等待认证会话建立
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const waitForAuthSession = async (): Promise<any> => {
      const maxRetries = 5;
      const retryDelay = 1000; // 1秒

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();

          if (error) {
            console.error(
              `会话获取错误 (尝试 ${attempt}/${maxRetries}):`,
              error
            );
            throw error;
          }

          if (session?.user) {
            return session.user;
          }

          // 如果不是最后一次尝试，等待后重试
          if (attempt < maxRetries) {
            console.log(`等待会话建立... (尝试 ${attempt}/${maxRetries})`);
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
          }
        } catch (error) {
          console.error(`会话检查失败 (尝试 ${attempt}/${maxRetries}):`, error);
          if (attempt === maxRetries) {
            throw error;
          }
        }
      }

      throw new Error("未能获取用户会话，请重试登录");
    };

    // 处理认证成功
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSuccessfulAuth = async (user: any) => {
      try {
        if (!mounted) return;

        setState({
          status: "success",
          message: "登录成功！正在设置账户...",
        });

        // 确保用户配置存在
        await ensureUserProfile(user);

        // 尝试将第一个用户提升为管理员（静默处理）
        try {
          await promoteFirstUserToAdmin();
        } catch (error) {
          console.log("提升管理员状态:", error);
        }

        // 获取重定向URL
        const redirectTo = searchParams.get("redirectTo") || "/";

        // 更新状态消息
        setState({
          status: "success",
          message: "账户设置完成！正在重定向...",
        });

        // 延迟重定向，让用户看到成功消息
        setTimeout(() => {
          if (mounted) {
            router.push(redirectTo);
          }
        }, 1500);
      } catch (error) {
        if (!mounted) return;

        console.error("处理认证成功回调失败:", error);
        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "登录成功，但设置过程中出现问题",
        });
      }
    };

    handleAuthCallback();

    return () => {
      mounted = false;
    };
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
        <AuthCallbackStatus status={state.status} message={state.message} />
      </div>
    </div>
  );
}

// 状态显示组件
function AuthCallbackStatus({
  status,
  message,
}: {
  status: string;
  message: string;
}) {
  if (status === "loading") {
    return (
      <>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <h2 className="mt-4 text-xl font-semibold text-gray-900">
          验证登录信息
        </h2>
        <p className="mt-2 text-gray-600">{message}</p>
        <p className="mt-4 text-sm text-gray-500">这可能需要几秒钟时间...</p>
      </>
    );
  }

  if (status === "success") {
    return (
      <>
        <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-semibold text-gray-900">登录成功！</h2>
        <p className="mt-2 text-gray-600">{message}</p>
      </>
    );
  }

  if (status === "error") {
    return (
      <>
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
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="mt-4 text-xl font-semibold text-gray-900">登录失败</h2>
        <p className="mt-2 text-gray-600">{message}</p>
        <p className="mt-4 text-sm text-gray-500">
          将在3秒后自动返回登录页面...
        </p>
      </>
    );
  }

  return null;
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              处理登录信息...
            </h2>
            <p className="mt-2 text-gray-600">正在验证您的身份</p>
          </div>
        </div>
      }
    >
      <AuthCallbackPageContent />
    </Suspense>
  );
}
