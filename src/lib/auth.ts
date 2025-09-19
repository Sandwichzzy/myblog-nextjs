import { supabase, supabaseAdmin } from "./supabase";
import type { AuthUser, UserProfile } from "@/types/database";
import type { Provider } from "@supabase/supabase-js";

// ============================================================================
// 认证工具函数
// ============================================================================

/**
 * 使用OAuth提供商登录（客户端版本，已弃用，建议使用服务端API）
 * @param provider OAuth提供商 ('github' | 'google')
 * @deprecated 建议使用 /api/auth/signin API 路由
 */
export async function signInWithProvider(provider: Provider) {
  // 使用客户端当前域名
  const redirectUrl = `${window.location.origin}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectUrl,
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
 * 获取当前登录用户信息
 * 包含用户基本信息和配置信息
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    // 直接获取用户信息，不检查会话
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("获取用户信息失败:", error);
      return null;
    }

    if (!user) {
      console.log("用户未登录");
      return null;
    }

    console.log("获取到用户信息:", user.email);

    // 获取用户配置信息
    let profile = null;
    try {
      profile = await getUserProfile(user.id);
    } catch (profileError) {
      console.error("获取用户配置失败:", profileError);

      // 如果获取失败，尝试创建用户配置
      try {
        console.log("尝试创建用户配置...");
        profile = await ensureUserProfile({
          id: user.id,
          email: user.email,
          user_metadata: user.user_metadata,
        });
        console.log("用户配置创建成功:", profile);
      } catch (createError) {
        console.error("创建用户配置失败:", createError);
        // 配置获取/创建失败不阻塞用户登录
      }
    }

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
  console.log(`获取用户 ${userId} 的配置`);

  try {
    // 添加超时保护
    const timeoutPromise = new Promise<null>((_, reject) => {
      setTimeout(() => reject(new Error("获取用户配置超时")), 8000); // 8秒超时
    });

    const profilePromise = supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    // 使用Promise.race实现超时
    const result = await Promise.race([profilePromise, timeoutPromise]);
    if (!result) throw new Error("获取用户配置超时");
    const { data, error } = result;

    if (error) {
      console.error("获取用户配置失败:", error);
      return null;
    }

    console.log("获取用户配置结果:", data);
    return data;
  } catch (error) {
    console.error("获取用户配置异常:", error);
    return null;
  }
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

  console.log(`为用户 ${user.id} 创建用户配置，显示名称: ${displayName}`);

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

  console.log("用户配置创建成功:", data);
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
  console.log(`确保用户 ${user.id} (${user.email}) 的配置存在`);

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

  console.log("用户配置已存在:", profile);
  return profile;
}

/**
 * 检查用户是否为管理员
 * @param userId 用户ID（可选，默认为当前用户）
 */
export async function isUserAdmin(userId?: string): Promise<boolean> {
  try {
    // 如果没有提供userId，直接使用当前用户
    if (!userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        console.log("检查管理员权限: 未找到当前用户");
        return false;
      }
      userId = user.id;
    }

    console.log(`检查用户 ${userId} 的管理员权限`);

    // 添加超时保护
    const timeoutPromise = new Promise<null>((_, reject) => {
      setTimeout(() => reject(new Error("检查管理员权限超时")), 5000); // 5秒超时
    });

    const adminCheckPromise = supabase
      .from("user_profiles")
      .select("role, is_active, display_name")
      .eq("id", userId)
      .maybeSingle();

    // 使用Promise.race实现超时
    const result = await Promise.race([adminCheckPromise, timeoutPromise]);
    if (!result) throw new Error("检查管理员权限超时");
    const { data, error } = result;

    if (error) {
      console.error("检查管理员权限失败:", error);
      return false;
    }

    console.log("用户配置查询结果:", data);

    // 如果用户配置不存在，返回 false
    if (!data) {
      console.log("用户配置不存在");
      return false;
    }

    // 检查用户是否激活
    if (!data.is_active) {
      console.log("用户未激活");
      return false;
    }

    const isAdmin = data.role === "admin";
    console.log(`用户角色: ${data.role}, 是否为管理员: ${isAdmin}`);

    return isAdmin;
  } catch (error) {
    console.error("检查管理员权限异常:", error);
    return false;
  }
}

/**
 * 将第一个注册用户提升为管理员
 * 这是唯一需要使用 supabaseAdmin 的函数，因为它需要系统级权限
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
