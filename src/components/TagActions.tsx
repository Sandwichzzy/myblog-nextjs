"use client";

import { useState } from "react";

interface TagActionsProps {
  tagId: string;
  tagName: string;
}

export default function TagActions({ tagId, tagName }: TagActionsProps) {
  // const router = useRouter(); // 保留以备后用
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    // TODO: 实现编辑标签功能
    // 这里可以打开一个模态框或跳转到编辑页面
    console.log("编辑标签:", tagId);
    alert("编辑功能即将实现");
  };

  const handleDelete = async () => {
    if (!confirm(`确定要删除标签 "${tagName}" 吗？`)) {
      return;
    }

    setIsDeleting(true);

    try {
      // TODO: 实现删除API调用
      // const response = await fetch(`/api/tags/${tagId}`, {
      //   method: "DELETE",
      // });

      // 暂时模拟删除成功
      console.log("删除标签:", tagId);
      alert("删除功能即将实现");

      // const result = await response.json();
      // if (result.success) {
      //   router.refresh();
      // } else {
      //   alert(`删除失败: ${result.message || "未知错误"}`);
      // }
    } catch (error) {
      console.error("删除标签失败:", error);
      alert("删除失败，请稍后重试");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleEdit}
        className="text-blue-600 hover:text-blue-800 text-sm"
      >
        编辑
      </button>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDeleting ? "删除中..." : "删除"}
      </button>
    </div>
  );
}
