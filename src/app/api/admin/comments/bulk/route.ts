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

interface BulkCommentActionBody {
  commentIds: string[];
  action: "approve" | "reject";
  published?: boolean;
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
 * POST /api/admin/comments/bulk - 批量操作评论
 */
async function handleBulkCommentAction(req: NextRequest) {
  await checkAdminPermission(req);

  const body = (await parseJsonBody(req)) as BulkCommentActionBody;
  const { commentIds, action, published } = body;

  if (!Array.isArray(commentIds) || commentIds.length === 0) {
    throw ApiErrors.badRequest("评论ID数组不能为空");
  }

  if (!["approve", "reject"].includes(action)) {
    throw ApiErrors.badRequest("action 必须是 approve 或 reject");
  }

  const results = [];
  const errors = [];

  for (const commentId of commentIds) {
    try {
      if (action === "approve") {
        const updatedComment = await moderateComment(
          commentId,
          published ?? true
        );
        results.push({ id: commentId, success: true, data: updatedComment });
      } else if (action === "reject") {
        await deleteComment(commentId);
        results.push({ id: commentId, success: true, data: null });
      }
    } catch (error) {
      console.error(`批量操作评论 ${commentId} 失败:`, error);
      errors.push({
        id: commentId,
        success: false,
        error: error instanceof Error ? error.message : "操作失败",
      });
    }
  }

  const successCount = results.filter((r) => r.success).length;
  const errorCount = errors.length;

  return createSuccessResponse(
    {
      results: [...results, ...errors],
      summary: {
        total: commentIds.length,
        success: successCount,
        failed: errorCount,
      },
    },
    `批量操作完成: ${successCount} 成功, ${errorCount} 失败`
  );
}

// 导出路由处理器
export const POST = withApiHandler(
  withMethodCheck(["POST"])(handleBulkCommentAction)
);
