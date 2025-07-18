import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { Provider } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const { provider } = await request.json();

    // 验证 provider 参数
    if (!provider || !["github", "google"].includes(provider)) {
      return NextResponse.json(
        { success: false, error: "无效的登录提供商" },
        { status: 400 }
      );
    }

    // 使用 headers().get('origin') 自动获取当前域名
    const origin = request.headers.get("origin");

    console.log("origin", origin);
    if (!origin) {
      return NextResponse.json(
        { success: false, error: "无法获取当前域名" },
        { status: 400 }
      );
    }

    // 构建回调 URL
    const redirectUrl = `${origin}/auth/callback`;

    // 调用 Supabase OAuth
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as Provider,
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) {
      console.error("OAuth 登录失败:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    // 返回重定向 URL
    return NextResponse.json({
      success: true,
      url: data.url,
    });
  } catch (error) {
    console.error("登录 API 错误:", error);
    return NextResponse.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
