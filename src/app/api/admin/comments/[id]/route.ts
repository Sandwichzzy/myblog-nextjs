import { NextRequest } from "next/server";
import {
  withApiHandler,
  withMethodCheck,
  createSuccessResponse,
  parseJsonBody,
  ApiErrors,
} from "@/lib/api-utils";
import { moderateComment, deleteComment } from "@/lib/comments";
import { supabaseAdmin } from "@/lib/supabase";

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface CommentActionBody {
  published?: boolean;
  action?: "delete" | "moderate";
}

/**
 * 服务器端管理员权限检查
 */
async function checkAdminPermission(req: NextRequest) {
  // 1. 检查认证头
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    throw ApiErrors.unauthorized("需要登录才能访问");
  }

  // 2. 验证用户身份
  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));

  if (authError || !user) {
    console.error("用户身份验证失败:", authError);
    throw ApiErrors.unauthorized("用户身份验证失败");
  }

  // 3. 检查管理员权限
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("user_profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (profileError) {
    console.error("检查管理员权限失败:", profileError);
    throw ApiErrors.forbidden("权限检查失败");
  }

  if (!profile || profile.role !== "admin") {
    throw ApiErrors.forbidden("需要管理员权限");
  }

  return user;
}

/**
 * PATCH /api/admin/comments/[id] - 审核评论
 */
async function handleModerateComment(
  req: NextRequest,
  { params }: RouteParams
) {
  await checkAdminPermission(req);

  const { id } = await params;
  const body = (await parseJsonBody(req)) as CommentActionBody;
  const { published, action } = body;

  if (action === "delete") {
    await deleteComment(id);
    return createSuccessResponse(null, "评论已删除");
  }

  if (typeof published !== "boolean") {
    throw ApiErrors.badRequest("published 字段必须是布尔值");
  }

  const updatedComment = await moderateComment(id, published);

  return createSuccessResponse(
    updatedComment,
    published ? "评论已审核通过" : "评论已设为待审核"
  );
}

/**
 * DELETE /api/admin/comments/[id] - 删除评论
 */
async function handleDeleteComment(req: NextRequest, { params }: RouteParams) {
  await checkAdminPermission(req);

  const { id } = await params;

  await deleteComment(id);

  return createSuccessResponse(null, "评论已删除");
}

// 导出的路由处理器
export const PATCH = withApiHandler(
  withMethodCheck(["PATCH"])(handleModerateComment)
);

export const DELETE = withApiHandler(
  withMethodCheck(["DELETE"])(handleDeleteComment)
);
