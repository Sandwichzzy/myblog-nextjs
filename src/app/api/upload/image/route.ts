import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/image-upload";

export async function POST(request: NextRequest) {
  try {
    // 验证用户权限（可选）
    // const user = await getCurrentUser(request);
    // if (!user) {
    //   return NextResponse.json({ error: '需要登录' }, { status: 401 });
    // }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json(
        { error: "请选择要上传的文件" },
        { status: 400 }
      );
    }

    // 上传图片到 Supabase Storage
    const result = await uploadImage(file, "images", folder);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      path: result.path,
    });
  } catch (error) {
    console.error("图片上传API错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
