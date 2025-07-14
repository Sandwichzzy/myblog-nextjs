"use client";

import { useState, useEffect } from "react";
import { Comment } from "@/types/database";
import { formatDate } from "@/lib/utils";
import { LoadingSpinner } from "@/components";

interface CommentListProps {
  articleId: string;
  initialComments?: Comment[];
}

export default function CommentList({
  articleId,
  initialComments = [],
}: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // 获取评论
  const fetchComments = async (
    pageNum: number = 1,
    append: boolean = false
  ) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/comments?articleId=${articleId}&page=${pageNum}&limit=10`
      );
      if (!response.ok) throw new Error("获取评论失败");

      const data = await response.json();

      if (append) {
        setComments((prev) => [...prev, ...data.data]);
      } else {
        setComments(data.data);
      }

      setTotalCount(data.pagination.totalCount);
      setHasMore(data.pagination.page < data.pagination.totalPages);
    } catch (error) {
      console.error("获取评论失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化时如果没有初始评论就获取
  useEffect(() => {
    if (initialComments.length === 0) {
      fetchComments(1);
    }
  }, [articleId]);

  // 加载更多评论
  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchComments(nextPage, true);
    }
  };

  // 刷新评论（新评论提交后调用）
  const refreshComments = () => {
    setPage(1);
    fetchComments(1, false);
  };

  if (loading && comments.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">评论</h3>
        <LoadingSpinner message="正在加载评论..." size="sm" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          评论 {totalCount > 0 && `(${totalCount})`}
        </h3>
        <button
          onClick={refreshComments}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          刷新
        </button>
      </div>

      {comments.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">
            还没有评论，来做第一个评论者吧！
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start space-x-3">
                {/* 头像 */}
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {comment.author_name[0].toUpperCase()}
                </div>

                <div className="flex-1 min-w-0">
                  {/* 评论头部 */}
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      {comment.author_name}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>

                  {/* 评论内容 */}
                  <div className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                    {comment.content}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* 加载更多按钮 */}
          {hasMore && (
            <div className="text-center">
              <button
                onClick={loadMore}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    加载中...
                  </>
                ) : (
                  "加载更多评论"
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
