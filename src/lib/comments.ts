import { supabase, supabaseAdmin } from "./supabase";
import { Comment, CommentInsert, CommentUpdate } from "@/types/database";

// 获取文章的已发布评论
export async function getArticleComments(
  articleId: string,
  page: number = 1,
  limit: number = 20
): Promise<{
  comments: Comment[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("comments")
    .select("*", { count: "exact" })
    .eq("article_id", articleId)
    .eq("published", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`Failed to fetch comments: ${error.message}`);
  }

  return {
    comments: data || [],
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
    currentPage: page,
  };
}

// 创建评论
export async function createComment(
  commentData: CommentInsert
): Promise<Comment> {
  const { data, error } = await supabase
    .from("comments")
    .insert({
      ...commentData,
      published: false, // 默认需要审核
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create comment: ${error.message}`);
  }

  return data;
}

// 获取待审核的评论（管理员功能）
export async function getPendingComments(
  page: number = 1,
  limit: number = 20
): Promise<{
  comments: (Comment & { article_title?: string })[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}> {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabaseAdmin
    .from("comments")
    .select(
      `
      *,
      article:articles(title)
    `,
      { count: "exact" }
    )
    .eq("published", false)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`Failed to fetch pending comments: ${error.message}`);
  }

  const commentsWithTitles = (data || []).map((comment: any) => ({
    ...comment,
    article_title: comment.article?.title,
  }));

  return {
    comments: commentsWithTitles,
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
    currentPage: page,
  };
}

// 审核评论（管理员功能）
export async function moderateComment(
  commentId: string,
  published: boolean
): Promise<Comment> {
  const { data, error } = await supabaseAdmin
    .from("comments")
    .update({ published })
    .eq("id", commentId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to moderate comment: ${error.message}`);
  }

  return data;
}

// 删除评论（管理员功能）
export async function deleteComment(commentId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error) {
    throw new Error(`Failed to delete comment: ${error.message}`);
  }
}

// 更新评论（管理员功能）
export async function updateComment(
  commentId: string,
  updates: CommentUpdate
): Promise<Comment> {
  const { data, error } = await supabaseAdmin
    .from("comments")
    .update(updates)
    .eq("id", commentId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update comment: ${error.message}`);
  }

  return data;
}

// 获取评论统计
export async function getCommentStats(): Promise<{
  totalComments: number;
  pendingComments: number;
  publishedComments: number;
}> {
  const [totalResult, pendingResult, publishedResult] = await Promise.all([
    supabaseAdmin.from("comments").select("*", { count: "exact", head: true }),
    supabaseAdmin
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("published", false),
    supabaseAdmin
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("published", true),
  ]);

  return {
    totalComments: totalResult.count || 0,
    pendingComments: pendingResult.count || 0,
    publishedComments: publishedResult.count || 0,
  };
}

// 批量审核评论
export async function bulkModerateComments(
  commentIds: string[],
  published: boolean
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("comments")
    .update({ published })
    .in("id", commentIds);

  if (error) {
    throw new Error(`Failed to bulk moderate comments: ${error.message}`);
  }
}

// 获取最新评论（管理员功能）
export async function getRecentComments(
  limit: number = 10
): Promise<(Comment & { article_title?: string })[]> {
  const { data, error } = await supabaseAdmin
    .from("comments")
    .select(
      `
      *,
      article:articles(title)
    `
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch recent comments: ${error.message}`);
  }

  return (data || []).map((comment: any) => ({
    ...comment,
    article_title: comment.article?.title,
  }));
}
