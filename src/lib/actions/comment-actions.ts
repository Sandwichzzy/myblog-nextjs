"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase";
import {
  moderateComment,
  deleteComment,
  getPendingComments,
} from "@/lib/comments";

// ============================================================================
// 评论管理 Server Actions
// ============================================================================
// 直接在服务器端处理评论CRUD操作，避免API调用开销
// 适用于管理员后台的评论审核功能
// ============================================================================

/**
 * 验证管理员权限
 */
async function verifyAdminPermission(userId: string) {
  if (!userId) {
    throw new Error("用户ID不能为空");
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("user_profiles")
    .select("role, is_active")
    .eq("id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (profileError) {
    console.error("检查管理员权限失败:", profileError);
    throw new Error("权限验证失败");
  }

  if (!profile || profile.role !== "admin") {
    throw new Error("需要管理员权限");
  }

  return profile;
}

/**
 * 审核单个评论 Server Action
 */
export async function approveCommentAction(commentId: string, userId: string) {
  try {
    await verifyAdminPermission(userId);

    const updatedComment = await moderateComment(commentId, true);

    // 重新验证相关页面缓存
    revalidatePath("/admin/comments");
    revalidatePath("/articles/[slug]", "page");

    return {
      success: true,
      message: "评论已审核通过",
      data: updatedComment,
    };
  } catch (error) {
    console.error("审核评论失败:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "审核失败",
    };
  }
}

/**
 * 删除单个评论 Server Action
 */
export async function deleteCommentAction(commentId: string, userId: string) {
  try {
    await verifyAdminPermission(userId);

    await deleteComment(commentId);

    // 重新验证相关页面缓存
    revalidatePath("/admin/comments");
    revalidatePath("/articles/[slug]", "page");

    return {
      success: true,
      message: "评论已删除",
    };
  } catch (error) {
    console.error("删除评论失败:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "删除失败",
    };
  }
}

/**
 * 批量审核评论 Server Action
 */
export async function bulkApproveCommentsAction(
  commentIds: string[],
  userId: string
) {
  try {
    await verifyAdminPermission(userId);

    if (!Array.isArray(commentIds) || commentIds.length === 0) {
      throw new Error("评论ID数组不能为空");
    }

    const results = [];
    const errors = [];

    for (const commentId of commentIds) {
      try {
        const updatedComment = await moderateComment(commentId, true);
        results.push({ id: commentId, success: true, data: updatedComment });
      } catch (error) {
        console.error(`批量审核评论 ${commentId} 失败:`, error);
        errors.push({
          id: commentId,
          success: false,
          error: error instanceof Error ? error.message : "操作失败",
        });
      }
    }

    // 重新验证相关页面缓存
    revalidatePath("/admin/comments");
    revalidatePath("/articles/[slug]", "page");

    return {
      success: true,
      message: `批量审核完成: ${results.length} 成功, ${errors.length} 失败`,
      data: { results, errors, total: commentIds.length },
    };
  } catch (error) {
    console.error("批量审核失败:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "批量审核失败",
    };
  }
}

/**
 * 批量删除评论 Server Action
 */
export async function bulkDeleteCommentsAction(
  commentIds: string[],
  userId: string
) {
  try {
    await verifyAdminPermission(userId);

    if (!Array.isArray(commentIds) || commentIds.length === 0) {
      throw new Error("评论ID数组不能为空");
    }

    const results = [];
    const errors = [];

    for (const commentId of commentIds) {
      try {
        await deleteComment(commentId);
        results.push({ id: commentId, success: true, data: null });
      } catch (error) {
        console.error(`批量删除评论 ${commentId} 失败:`, error);
        errors.push({
          id: commentId,
          success: false,
          error: error instanceof Error ? error.message : "操作失败",
        });
      }
    }

    // 重新验证相关页面缓存
    revalidatePath("/admin/comments");
    revalidatePath("/articles/[slug]", "page");

    return {
      success: true,
      message: `批量删除完成: ${results.length} 成功, ${errors.length} 失败`,
      data: { results, errors, total: commentIds.length },
    };
  } catch (error) {
    console.error("批量删除失败:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "批量删除失败",
    };
  }
}

/**
 * 获取待审核评论 Server Action
 */
export async function getPendingCommentsAction(
  page: number = 1,
  limit: number = 20,
  userId: string
) {
  try {
    await verifyAdminPermission(userId);

    const result = await getPendingComments(page, limit);

    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("获取待审核评论失败:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "获取数据失败",
      data: {
        comments: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: page,
      },
    };
  }
}

/**
 * 表单处理：审核评论
 */
export async function handleApproveComment(formData: FormData) {
  const commentId = formData.get("commentId") as string;
  const userId = formData.get("userId") as string;

  if (!commentId || !userId) {
    throw new Error("缺少必要参数");
  }

  const result = await approveCommentAction(commentId, userId);

  if (!result.success) {
    throw new Error(result.message);
  }
}

/**
 * 表单处理：删除评论
 */
export async function handleDeleteComment(formData: FormData) {
  const commentId = formData.get("commentId") as string;
  const userId = formData.get("userId") as string;

  if (!commentId || !userId) {
    throw new Error("缺少必要参数");
  }

  const result = await deleteCommentAction(commentId, userId);

  if (!result.success) {
    throw new Error(result.message);
  }
}

/**
 * 表单处理：批量操作
 */
export async function handleBulkCommentAction(formData: FormData) {
  const action = formData.get("action") as string;
  const commentIdsString = formData.get("commentIds") as string;
  const userId = formData.get("userId") as string;

  if (!action || !commentIdsString || !userId) {
    throw new Error("缺少必要参数");
  }

  const commentIds = JSON.parse(commentIdsString);

  let result;
  if (action === "approve") {
    result = await bulkApproveCommentsAction(commentIds, userId);
  } else if (action === "delete") {
    result = await bulkDeleteCommentsAction(commentIds, userId);
  } else {
    throw new Error("无效的操作类型");
  }

  if (!result.success) {
    throw new Error(result.message);
  }
}
