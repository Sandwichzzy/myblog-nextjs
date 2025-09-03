"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tag } from "@/types/database";
import TagEditModal from "./TagEditModal";

interface TagActionsProps {
  tag: Tag;
  onUpdate?: (updatedTag: Tag) => void;
  onDelete?: (tagId: string) => void;
}

export default function TagActions({
  tag,
  onUpdate,
  onDelete,
}: TagActionsProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleUpdateSuccess = (updatedTag: Tag) => {
    if (onUpdate) {
      onUpdate(updatedTag);
    } else {
      // 如果没有提供回调，刷新页面
      router.refresh();
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `确定要删除标签 "${tag.name}" 吗？\n\n注意：删除标签不会影响已关联的文章，但会解除关联关系。`
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/tags/${tag.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        alert(
          `标签 "${tag.name}" 删除成功！\n\n提示：如果您在文章页面看到删除的标签仍然存在，请点击"刷新标签"按钮或等待约2分钟缓存更新。`
        );
        if (onDelete) {
          onDelete(tag.id);
        } else {
          // 如果没有提供回调，刷新页面
          router.refresh();
        }
      } else {
        alert(`删除失败: ${result.message || "未知错误"}`);
      }
    } catch (error) {
      console.error("删除标签失败:", error);
      alert("删除失败，请稍后重试");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        <button
          onClick={handleEdit}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          编辑
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDeleting ? "删除中..." : "删除"}
        </button>
      </div>

      {/* 编辑模态框 */}
      <TagEditModal
        tag={tag}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={handleUpdateSuccess}
      />
    </>
  );
}
