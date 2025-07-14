"use client";

import { useState, useEffect } from "react";
import { Comment } from "@/types/database";
import { formatDate } from "@/lib/utils";
import { LoadingSpinner } from "@/components";
import { supabase } from "@/lib/supabase";

interface CommentWithArticle extends Comment {
  article_title?: string;
}

interface CommentManagementProps {
  initialComments?: CommentWithArticle[];
  showPendingOnly?: boolean;
}

export default function CommentManagement({
  initialComments = [],
  showPendingOnly = false,
}: CommentManagementProps) {
  const [comments, setComments] =
    useState<CommentWithArticle[]>(initialComments);
  const [loading, setLoading] = useState(false);
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "published">(
    showPendingOnly ? "pending" : "all"
  );

  // 获取评论列表
  const fetchComments = async () => {
    setLoading(true);
    try {
      const url =
        filter === "pending"
          ? "/api/comments?published=false&limit=50"
          : "/api/comments?limit=50";

      const response = await fetch(url);
      if (!response.ok) throw new Error("获取评论失败");

      const data = await response.json();
      setComments(data.data);
    } catch (error) {
      console.error("获取评论失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    if (initialComments.length === 0) {
      fetchComments();
    }
  }, [filter]);

  // 审核单个评论
  const moderateComment = async (
    commentId: string,
    action: "approve" | "reject"
  ) => {
    setActionLoading(commentId);
    try {
      // 获取用户认证令牌
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("用户未登录");
      }

      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          published: action === "approve",
          action: action === "reject" ? "delete" : "moderate",
        }),
      });

      if (!response.ok)
        throw new Error(`${action === "approve" ? "审核通过" : "删除"}失败`);

      // 移除已处理的评论
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      setSelectedComments((prev) => prev.filter((id) => id !== commentId));
    } catch (error) {
      console.error(
        `${action === "approve" ? "审核" : "删除"}评论失败:`,
        error
      );
      alert(`${action === "approve" ? "审核通过" : "删除"}失败`);
    } finally {
      setActionLoading(null);
    }
  };

  // 批量操作
  const bulkAction = async (action: "approve" | "reject") => {
    if (selectedComments.length === 0) return;

    setActionLoading("bulk");
    try {
      // 获取用户认证令牌
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("用户未登录");
      }

      const response = await fetch("/api/admin/comments/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          commentIds: selectedComments,
          action,
          published: action === "approve",
        }),
      });

      if (!response.ok)
        throw new Error(`批量${action === "approve" ? "审核" : "删除"}失败`);

      // 移除已处理的评论
      setComments((prev) =>
        prev.filter((c) => !selectedComments.includes(c.id))
      );
      setSelectedComments([]);
    } catch (error) {
      console.error(
        `批量${action === "approve" ? "审核" : "删除"}失败:`,
        error
      );
      alert(`批量${action === "approve" ? "审核" : "删除"}失败`);
    } finally {
      setActionLoading(null);
    }
  };

  // 选择/取消选择评论
  const toggleCommentSelection = (commentId: string) => {
    setSelectedComments((prev) =>
      prev.includes(commentId)
        ? prev.filter((id) => id !== commentId)
        : [...prev, commentId]
    );
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    setSelectedComments(
      selectedComments.length === comments.length
        ? []
        : comments.map((c) => c.id)
    );
  };

  if (loading) {
    return <LoadingSpinner message="正在加载评论..." />;
  }

  return (
    <div className="space-y-6">
      {/* 头部操作区 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            评论管理 ({comments.length})
          </h2>

          {/* 筛选器 */}
          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as "all" | "pending" | "published")
            }
            className="text-sm border border-gray-300 rounded-md px-3 py-1"
          >
            <option value="all">全部评论</option>
            <option value="pending">待审核</option>
            <option value="published">已发布</option>
          </select>
        </div>

        {/* 批量操作 */}
        {selectedComments.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              已选择 {selectedComments.length} 条
            </span>
            <button
              onClick={() => bulkAction("approve")}
              disabled={actionLoading === "bulk"}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              批量通过
            </button>
            <button
              onClick={() => bulkAction("reject")}
              disabled={actionLoading === "bulk"}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              批量删除
            </button>
          </div>
        )}
      </div>

      {/* 评论列表 */}
      {comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">暂无评论</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* 表头 */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedComments.length === comments.length}
                onChange={toggleSelectAll}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <span className="ml-3 text-sm font-medium text-gray-900">
                全选
              </span>
            </div>
          </div>

          {/* 评论项 */}
          <div className="divide-y divide-gray-200">
            {comments.map((comment) => (
              <div key={comment.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start space-x-4">
                  {/* 选择框 */}
                  <input
                    type="checkbox"
                    checked={selectedComments.includes(comment.id)}
                    onChange={() => toggleCommentSelection(comment.id)}
                    className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300"
                  />

                  {/* 头像 */}
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {comment.author_name[0].toUpperCase()}
                  </div>

                  {/* 评论内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {comment.author_name}
                      </h4>
                      {comment.author_email && (
                        <span className="text-xs text-gray-500">
                          {comment.author_email}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">
                        {formatDate(comment.created_at)}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          comment.published
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {comment.published ? "已发布" : "待审核"}
                      </span>
                    </div>

                    {/* 文章标题 */}
                    {comment.article_title && (
                      <p className="text-xs text-blue-600 mb-2">
                        评论文章: {comment.article_title}
                      </p>
                    )}

                    {/* 评论内容 */}
                    <div className="text-sm text-gray-700 whitespace-pre-wrap break-words mb-3">
                      {comment.content}
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex space-x-2">
                      {!comment.published && (
                        <button
                          onClick={() => moderateComment(comment.id, "approve")}
                          disabled={actionLoading === comment.id}
                          className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          {actionLoading === comment.id ? "处理中..." : "通过"}
                        </button>
                      )}
                      <button
                        onClick={() => moderateComment(comment.id, "reject")}
                        disabled={actionLoading === comment.id}
                        className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        {actionLoading === comment.id ? "处理中..." : "删除"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
