"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface DeleteArticleButtonProps {
  articleId: string;
  articleTitle: string;
  slug: string;
}

export default function DeleteArticleButton({
  articleId,
  articleTitle,
  slug,
}: DeleteArticleButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`确定要删除文章 "${articleTitle}" 吗？此操作不可恢复。`)) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/articles/${slug}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        // 删除成功，刷新页面
        router.refresh();
      } else {
        alert(`删除失败: ${result.message || "未知错误"}`);
      }
    } catch (error) {
      console.error("删除文章失败:", error);
      alert("删除失败，请稍后重试");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isDeleting ? "删除中..." : "删除"}
    </button>
  );
}
