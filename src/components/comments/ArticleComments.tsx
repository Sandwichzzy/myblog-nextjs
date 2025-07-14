"use client";

import { useState } from "react";
import { Comment } from "@/types/database";
import CommentList from "./CommentList";
import CommentForm from "./CommentForm";

interface ArticleCommentsProps {
  articleId: string;
  initialComments?: Comment[];
}

export default function ArticleComments({
  articleId,
  initialComments = [],
}: ArticleCommentsProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleCommentSubmitted = () => {
    // 当新评论提交后，触发评论列表刷新
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-8">
      {/* 评论表单 */}
      <CommentForm
        articleId={articleId}
        onCommentSubmitted={handleCommentSubmitted}
      />

      {/* 评论列表 */}
      <CommentList
        key={refreshTrigger}
        articleId={articleId}
        initialComments={initialComments}
      />
    </div>
  );
}
