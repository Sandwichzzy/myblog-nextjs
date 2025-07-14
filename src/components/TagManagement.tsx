"use client";

import { useState } from "react";
import { Tag } from "@/types/database";
import { TagForm, TagActions } from "@/components";

interface TagManagementProps {
  initialTags: (Tag & { article_count: number })[];
}

export default function TagManagement({ initialTags }: TagManagementProps) {
  const [tags, setTags] = useState(initialTags);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // 处理新增标签
  const handleTagCreate = (newTag: Tag & { article_count: number }) => {
    setTags((prevTags) => [newTag, ...prevTags]);
  };

  // 处理标签更新
  const handleTagUpdate = (updatedTag: Tag) => {
    setTags((prevTags) =>
      prevTags.map((tag) =>
        tag.id === updatedTag.id
          ? { ...updatedTag, article_count: tag.article_count } // 保持原有的article_count
          : tag
      )
    );
  };

  // 处理标签删除
  const handleTagDelete = (tagId: string) => {
    setTags((prevTags) => prevTags.filter((tag) => tag.id !== tagId));
    setSelectedTags((prev) => prev.filter((id) => id !== tagId));
  };

  // 处理标签选择
  const handleTagSelection = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  // 全选/取消全选
  const handleSelectAll = () => {
    setSelectedTags(
      selectedTags.length === tags.length ? [] : tags.map((tag) => tag.id)
    );
  };

  // 批量删除
  const handleBulkDelete = async () => {
    if (selectedTags.length === 0) return;

    const tagNames = tags
      .filter((tag) => selectedTags.includes(tag.id))
      .map((tag) => tag.name)
      .join(", ");

    if (
      !confirm(
        `确定要删除以下 ${selectedTags.length} 个标签吗？\n\n${tagNames}\n\n注意：删除标签不会影响已关联的文章，但会解除关联关系。`
      )
    ) {
      return;
    }

    setIsDeleting(true);

    try {
      // 并行删除所有选中的标签
      const deletePromises = selectedTags.map((tagId) =>
        fetch(`/api/tags/${tagId}`, { method: "DELETE" })
          .then((response) => response.json())
          .then((result) => ({ tagId, result }))
      );

      const results = await Promise.all(deletePromises);

      // 处理结果
      const successfulDeletes: string[] = [];
      const failedDeletes: string[] = [];

      results.forEach(({ tagId, result }) => {
        if (result.success) {
          successfulDeletes.push(tagId);
        } else {
          failedDeletes.push(tagId);
        }
      });

      // 更新状态
      if (successfulDeletes.length > 0) {
        setTags((prevTags) =>
          prevTags.filter((tag) => !successfulDeletes.includes(tag.id))
        );
      }

      setSelectedTags([]);

      // 显示结果
      if (failedDeletes.length > 0) {
        const failedTagNames = tags
          .filter((tag) => failedDeletes.includes(tag.id))
          .map((tag) => tag.name)
          .join(", ");
        alert(`部分标签删除失败: ${failedTagNames}`);
      } else {
        alert(
          `成功删除 ${successfulDeletes.length} 个标签！\n\n提示：如果您在文章页面看到删除的标签仍然存在，请点击"刷新标签"按钮或等待约2分钟缓存更新。`
        );
      }
    } catch (error) {
      console.error("批量删除标签失败:", error);
      alert("批量删除失败，请稍后重试");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">标签管理</h1>
          <p className="mt-2 text-gray-600">管理博客标签，用于分类和组织文章</p>
        </div>

        {/* 创建新标签表单 */}
        <TagForm onTagCreate={handleTagCreate} />

        {/* 标签统计 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{tags.length}</p>
            <p className="text-sm text-gray-600">总标签数</p>
          </div>
        </div>

        {/* 标签列表 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">所有标签</h2>

              {/* 批量操作区域 */}
              {selectedTags.length > 0 && (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    已选择 {selectedTags.length} 个标签
                  </span>
                  <button
                    onClick={handleBulkDelete}
                    disabled={isDeleting}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? "删除中..." : "批量删除"}
                  </button>
                </div>
              )}
            </div>

            {/* 全选控制 */}
            {tags.length > 0 && (
              <div className="mt-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedTags.length === tags.length}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    {selectedTags.length === tags.length ? "取消全选" : "全选"}
                  </span>
                </label>
              </div>
            )}
          </div>

          {tags.length > 0 ? (
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className={`relative p-4 border rounded-lg hover:shadow-md transition-all ${
                      selectedTags.includes(tag.id)
                        ? "border-blue-300 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    {/* 选择框 */}
                    <div className="absolute top-2 left-2">
                      <input
                        type="checkbox"
                        checked={selectedTags.includes(tag.id)}
                        onChange={() => handleTagSelection(tag.id)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                      />
                    </div>

                    {/* 标签信息 */}
                    <div className="ml-6">
                      <div className="flex items-center space-x-3 mb-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        <span className="font-medium text-gray-900">
                          {tag.name}
                        </span>
                      </div>

                      {/* 文章计数 */}
                      <p className="text-xs text-gray-500 mb-3">
                        {tag.article_count} 篇文章
                      </p>

                      {/* 操作按钮 */}
                      <TagActions
                        tag={tag}
                        onUpdate={handleTagUpdate}
                        onDelete={handleTagDelete}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <p>暂无标签，请先创建标签</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
