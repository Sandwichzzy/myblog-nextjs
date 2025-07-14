import { supabase, supabaseAdmin } from "./supabase";
import type { AuthUser, UserProfile } from "@/types/database";
import type { Provider } from "@supabase/supabase-js";

// ============================================================================
// 认证工具函数
// ============================================================================

/**
 * 使用OAuth提供商登录
 * @param provider OAuth提供商 ('github' | 'google')
 */
export async function signInWithProvider(provider: Provider) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    throw new Error(`登录失败: ${error.message}`);
  }

  return data;
}

/**
 * 登出
 */
export async function signOut() {
  try {
    // 1. 调用Supabase的signOut
    const { error } = await supabase.auth.signOut();

    // 2. 强制清理localStorage中的Supabase数据
    if (typeof window !== "undefined") {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.includes("supabase") || key.includes("sb-"))) {
          localStorage.removeItem(key);
        }
      }

      // 3. 清理sessionStorage
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const key = sessionStorage.key(i);
        if (key && (key.includes("supabase") || key.includes("sb-"))) {
          sessionStorage.removeItem(key);
        }
      }
    }

    if (error) {
      console.warn(`Supabase登出警告: ${error.message}`);
      // 即使Supabase返回错误，我们也要清理本地存储
    }
  } catch (error) {
    console.error("登出过程中发生错误:", error);
    // 即使发生错误，也要清理本地存储
    if (typeof window !== "undefined") {
      localStorage.clear();
      sessionStorage.clear();
    }
    throw error;
  }
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    // 首先检查会话状态
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("获取会话失败:", sessionError);
      return null;
    }

    if (!session) {
      console.log("没有活跃的会话");
      return null;
    }

    // 如果会话即将过期，尝试刷新
    const now = Math.floor(Date.now() / 1000);
    if (session.expires_at && session.expires_at - now < 300) {
      // 5分钟内过期
      console.log("会话即将过期，尝试刷新...");
      const {
        data: { session: refreshedSession },
        error: refreshError,
      } = await supabase.auth.refreshSession();

      if (refreshError) {
        console.error("刷新会话失败:", refreshError);
        return null;
      }

      if (!refreshedSession) {
        console.log("刷新后没有会话");
        return null;
      }
    }

    // 获取用户信息
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.error("获取用户信息失败:", error);
      return null;
    }

    // 获取用户配置信息
    const profile = await getUserProfile(user.id);

    return {
      id: user.id,
      email: user.email,
      profile: profile || undefined,
    };
  } catch (error) {
    console.error("getCurrentUser 失败:", error);
    return null;
  }
}

/**
 * 获取用户配置信息
 * @param userId 用户ID
 */
export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  // 使用普通客户端查询用户自己的配置
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("获取用户配置失败:", error);
    return null;
  }

  return data;
}

/**
 * 创建用户配置
 * @param user Supabase 用户对象
 */
export async function createUserProfile(user: {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
  };
}): Promise<UserProfile> {
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "用户";

  const { data, error } = await supabase
    .from("user_profiles")
    .insert({
      id: user.id,
      display_name: displayName,
      avatar_url: user.user_metadata?.avatar_url || null,
      role: "user",
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("创建用户配置失败:", error);
    throw new Error(`创建用户配置失败: ${error.message}`);
  }

  return data;
}

/**
 * 确保用户配置存在，如果不存在则创建
 * @param user Supabase 用户对象
 */
export async function ensureUserProfile(user: {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
  };
}): Promise<UserProfile> {
  // 检查用户配置是否存在
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("检查用户配置失败:", profileError);
    throw new Error("无法验证用户配置");
  }

  // 如果用户配置不存在，创建新的
  if (!profile) {
    console.log("用户配置不存在，正在创建...");
    return await createUserProfile(user);
  }

  return profile;
}

/**
 * 检查用户是否为管理员
 * @param userId 用户ID（可选，默认为当前用户）
 */
export async function isUserAdmin(userId?: string): Promise<boolean> {
  try {
    // 如果没有提供userId，使用当前用户
    if (!userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return false;
      userId = user.id;
    }

    // 使用管理员客户端查询，绕过 RLS
    const { data, error } = await supabase
      .from("user_profiles")
      .select("role, is_active")
      .eq("id", userId)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("检查管理员权限失败:", error);
      return false;
    }

    // 如果用户配置不存在，返回 false
    if (!data) {
      return false;
    }

    return data.role === "admin";
  } catch (error) {
    console.error("检查管理员权限异常:", error);
    return false;
  }
}

/**
 * 将第一个注册用户提升为管理员
 */
export async function promoteFirstUserToAdmin() {
  try {
    // 使用管理员客户端调用数据库函数
    const { data, error } = await supabaseAdmin.rpc(
      "promote_first_user_to_admin"
    );

    if (error) {
      throw new Error(`提升管理员失败: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error("提升管理员异常:", error);
    throw error;
  }
}

/**
 * 监听认证状态变化
 * @param callback 回调函数
 */
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange(async (event, session) => {
    if (session?.user) {
      const profile = await getUserProfile(session.user.id);
      callback({
        id: session.user.id,
        email: session.user.email,
        profile: profile || undefined,
      });
    } else {
      callback(null);
    }
  });
}
