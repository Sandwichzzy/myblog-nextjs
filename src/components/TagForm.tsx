"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createTagSchema } from "@/lib/validations";
import { z } from "zod";

export default function TagForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    color: "#3B82F6",
  });

  // 检查标签名称是否已存在
  const checkTagName = useCallback(async (name: string) => {
    if (!name.trim()) {
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
          (tag: { name: string }) =>
            tag.name.toLowerCase() === name.toLowerCase()
        );

        if (existingTag) {
          setNameError(`标签名称 "${name}" 已存在`);
        } else {
          setNameError(null);
        }
      }
    } catch (error) {
      console.error("检查标签名称失败:", error);
      // 检查失败时不显示错误，允许用户继续
      setNameError(null);
    } finally {
      setIsChecking(false);
    }
  }, []);

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
      createTagSchema.parse(formData);
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

    // 使用 Zod 验证
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
      const response = await fetch("/api/tags", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        // 重置表单
        setFormData({ name: "", color: "#3B82F6" });
        // 刷新页面以显示新标签
        router.refresh();
      } else {
        // 处理不同类型的错误
        let errorMessage = result.message || "未知错误";

        if (
          errorMessage.includes(
            "duplicate key value violates unique constraint"
          )
        ) {
          errorMessage = `标签名称 "${formData.name}" 已存在，请使用其他名称`;
        } else if (errorMessage.includes("tags_name_key")) {
          errorMessage = `标签名称 "${formData.name}" 已存在，请使用其他名称`;
        }

        alert(`创建失败: ${errorMessage}`);
      }
    } catch (error) {
      console.error("创建标签失败:", error);
      alert("创建失败，请稍后重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">创建新标签</h2>
      <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-48">
          <label
            htmlFor="tagName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            标签名称
          </label>
          <div className="relative">
            <input
              type="text"
              id="tagName"
              value={formData.name}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, name: e.target.value }));
                // 清除之前的错误状态
                if (nameError) setNameError(null);
              }}
              placeholder="输入标签名称"
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:border-transparent ${
                nameError
                  ? "border-red-300 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              disabled={isSubmitting}
            />
            {isChecking && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
          {nameError && (
            <p className="mt-1 text-sm text-red-600">{nameError}</p>
          )}
        </div>

        <div className="w-32">
          <label
            htmlFor="tagColor"
            className="block text-sm font-medium text-gray-700 mb-2"
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
            className="w-full h-10 border border-gray-300 rounded-md"
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting || isChecking || !!nameError}
          className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "创建中..." : isChecking ? "检查中..." : "创建标签"}
        </button>
      </form>
    </div>
  );
}
