"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Comment } from "@/types/database";
import { formatDate } from "@/lib/utils";
import { LoadingSpinner } from "@/components";
import {
  handleApproveComment,
  handleDeleteComment,
  handleBulkCommentAction,
  getPendingCommentsAction,
} from "@/lib/actions/comment-actions";
import { CommentActionButton } from "./CommentActionButton";

interface CommentWithArticle extends Comment {
  article_title?: string;
}

interface CommentManagementServerProps {
  initialPage?: number;
  initialLimit?: number;
}

export default function CommentManagementServer({
  initialPage = 1,
  initialLimit = 20,
}: CommentManagementServerProps) {
  const { user, isAdmin } = useAuth();
  const [comments, setComments] = useState<CommentWithArticle[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [loading, setLoading] = useState(true);
  const [selectedComments, setSelectedComments] = useState<string[]>([]);

  // 加载评论数据
  const loadComments = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const result = await getPendingCommentsAction(
        currentPage,
        initialLimit,
        user.id
      );

      if (result.success) {
        setComments(result.data.comments);
        setTotalCount(result.data.totalCount);
        setTotalPages(result.data.totalPages);
      } else {
        console.error("加载评论失败:", result.message);
      }
    } catch (error) {
      console.error("加载评论失败:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, currentPage, initialLimit]);

  // 初始加载
  useEffect(() => {
    if (user?.id && isAdmin) {
      loadComments();
    }
  }, [loadComments, user?.id, isAdmin]);

  // 处理评论操作后的刷新
  const handleActionComplete = () => {
    loadComments();
    setSelectedComments([]);
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

  // 检查管理员权限
  if (!user || !isAdmin) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <h2 className="text-xl font-semibold text-red-900 mb-2">
            访问被拒绝
          </h2>
          <p className="text-red-700 mb-4">您需要管理员权限才能访问此页面。</p>
          <a
            href="/admin"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            返回管理后台
          </a>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner message="正在加载评论..." />;
  }

  return (
    <div className="space-y-6">
      {/* 头部操作区 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            待审核评论 ({totalCount})
          </h2>
        </div>

        {/* 批量操作 */}
        {selectedComments.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              已选择 {selectedComments.length} 条
            </span>
            <form
              action={async (formData: FormData) => {
                formData.set("action", "approve");
                formData.set("commentIds", JSON.stringify(selectedComments));
                formData.set("userId", user!.id);
                await handleBulkCommentAction(formData);
                handleActionComplete();
              }}
            >
              <button
                type="submit"
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
              >
                批量通过
              </button>
            </form>
            <form
              action={async (formData: FormData) => {
                formData.set("action", "delete");
                formData.set("commentIds", JSON.stringify(selectedComments));
                formData.set("userId", user!.id);
                await handleBulkCommentAction(formData);
                handleActionComplete();
              }}
            >
              <button
                type="submit"
                className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
              >
                批量删除
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 评论列表 */}
      {comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">暂无待审核评论</p>
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
                    </div>

                    {/* 评论内容 */}
                    <div className="text-sm text-gray-700 whitespace-pre-wrap break-words mb-3">
                      {comment.content}
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex space-x-2">
                      <form
                        action={async (formData: FormData) => {
                          formData.set("commentId", comment.id);
                          formData.set("userId", user!.id);
                          await handleApproveComment(formData);
                          handleActionComplete();
                        }}
                      >
                        <CommentActionButton type="approve">
                          通过
                        </CommentActionButton>
                      </form>
                      <form
                        action={async (formData: FormData) => {
                          formData.set("commentId", comment.id);
                          formData.set("userId", user!.id);
                          await handleDeleteComment(formData);
                          handleActionComplete();
                        }}
                      >
                        <CommentActionButton type="delete">
                          删除
                        </CommentActionButton>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1 text-sm rounded ${
                page === currentPage
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
