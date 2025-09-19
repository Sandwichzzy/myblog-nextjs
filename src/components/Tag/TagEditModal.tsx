"use client";

import { useState, useEffect, useCallback } from "react";
import { Tag } from "@/types/database";
import { updateTagSchema } from "@/lib/validations";
import { z } from "zod";

interface TagEditModalProps {
  tag: Tag;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedTag: Tag) => void;
}

export default function TagEditModal({
  tag,
  isOpen,
  onClose,
  onUpdate,
}: TagEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: tag.name,
    color: tag.color,
  });

  // 检查标签名称是否已存在（排除当前标签）
  const checkTagName = useCallback(
    async (name: string) => {
      if (!name.trim() || name === tag.name) {
        setNameError(null);
        return;
      }

      setIsChecking(true);
      try {
        const response = await fetch(
          `/api/tags?search=${encodeURIComponent(name)}`
        );
        const result = await response.json();

        if (result.success && result.data) {
          const existingTag = result.data.find(
            (t: Tag) =>
              t.name.toLowerCase() === name.toLowerCase() && t.id !== tag.id
          );

          if (existingTag) {
            setNameError(`标签名称 "${name}" 已存在`);
          } else {
            setNameError(null);
          }
        }
      } catch (error) {
        console.error("检查标签名称失败:", error);
        setNameError(null);
      } finally {
        setIsChecking(false);
      }
    },
    [tag.name, tag.id]
  );

  // 重置表单数据当标签改变时
  useEffect(() => {
    setFormData({
      name: tag.name,
      color: tag.color,
    });
    setNameError(null);
  }, [tag]);

  // 防抖处理标签名称检查
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      checkTagName(formData.name);
    }, 500); // 500ms 防抖

    return () => clearTimeout(timeoutId);
  }, [formData.name, checkTagName]);

  // 使用 Zod 验证表单
  const validateForm = () => {
    try {
      updateTagSchema.parse(formData);
      return { success: true, error: null };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        return { success: false, error: firstError.message };
      }
      return { success: false, error: "表单验证失败" };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证表单
    const validation = validateForm();
    if (!validation.success) {
      alert(validation.error);
      return;
    }

    if (nameError) {
      alert(nameError);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/tags/${tag.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        onUpdate(result.data);
        onClose();
      } else {
        alert(`更新失败: ${result.message || "未知错误"}`);
      }
    } catch (error) {
      console.error("更新标签失败:", error);
      alert("更新失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({ ...prev, name: value }));

    // 清除之前的错误状态
    if (nameError) setNameError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="web3-card p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            <span className="gradient-text">编辑标签</span>
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="tagName"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              标签名称
            </label>
            <div className="relative">
              <input
                type="text"
                id="tagName"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="输入标签名称"
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:border-transparent text-gray-900 bg-white transition-all ${
                  nameError
                    ? "border-red-400 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                disabled={isSubmitting}
              />
              {isChecking && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-4 w-4 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                </div>
              )}
            </div>
            {nameError && (
              <p className="mt-1 text-sm text-red-400">{nameError}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="tagColor"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              标签颜色
            </label>
            <input
              type="color"
              id="tagColor"
              value={formData.color}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, color: e.target.value }))
              }
              className="w-full h-10 border border-gray-600 rounded-md bg-gray-800"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 border border-gray-600 rounded-md hover:bg-gray-700/50 transition-all"
              disabled={isSubmitting}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isChecking || !!nameError}
              className="web3-button px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting
                ? "更新中..."
                : isChecking
                ? "检查中..."
                : "更新标签"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
