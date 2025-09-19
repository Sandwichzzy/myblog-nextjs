"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { createCommentSchema } from "@/lib/validations";
import { z } from "zod";

interface CommentFormProps {
  articleId: string;
  onCommentSubmitted?: () => void;
}

export default function CommentForm({
  articleId,
  onCommentSubmitted,
}: CommentFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    authorName: user?.profile?.display_name || "",
    authorEmail: user?.email || "",
    content: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // 使用 Zod 验证表单
  const validateForm = () => {
    try {
      createCommentSchema.parse({
        articleId,
        authorName: formData.authorName,
        authorEmail: formData.authorEmail || null,
        content: formData.content,
      });
      setMessage(null);
      setFieldErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // 收集所有字段错误
        const errors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path.length > 0) {
            errors[err.path[0] as string] = err.message;
          }
        });
        setFieldErrors(errors);

        // 设置第一个错误作为主要错误消息
        const firstError = error.errors[0];
        setMessage({ type: "error", text: firstError.message });
      } else {
        setMessage({ type: "error", text: "表单验证失败" });
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 检查用户是否已登录
    if (!user) {
      setMessage({ type: "error", text: "请先登录才能发表评论" });
      return;
    }

    // 使用 Zod 验证表单
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      // 获取用户的访问令牌
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setMessage({ type: "error", text: "用户身份验证失败，请重新登录" });
        return;
      }

      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          articleId,
          authorName: formData.authorName.trim(),
          authorEmail: formData.authorEmail.trim() || null,
          content: formData.content.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "提交评论失败");
      }

      setMessage({
        type: "success",
        text: result.message || "评论已提交，等待管理员审核后显示",
      });

      // 清空表单
      setFormData({
        ...formData,
        content: "",
      });

      // 通知父组件刷新评论
      if (onCommentSubmitted) {
        onCommentSubmitted();
      }
    } catch (error) {
      console.error("提交评论失败:", error);
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "提交评论失败，请稍后重试",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // 清除该字段的错误状态
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // 清除错误消息
    if (message?.type === "error") {
      setMessage(null);
    }
  };

  return (
    <div className="web3-card p-6">
      <h3 className="text-lg font-semibold mb-4">
        <span className="gradient-text">发表评论</span>
      </h3>

      {/* 未登录用户提示 */}
      {!user && (
        <div className="mb-4 p-4 bg-blue-900/20 border border-blue-400/30 rounded-md backdrop-blur-sm">
          <p className="text-sm text-blue-300">
            请先{" "}
            <a
              href="/auth/login"
              className="font-medium text-blue-400 hover:text-blue-300 underline transition-colors"
            >
              登录
            </a>{" "}
            后再发表评论
          </p>
        </div>
      )}

      {/* 消息提示 */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-md text-sm border backdrop-blur-sm ${
            message.type === "success"
              ? "bg-green-900/20 text-green-300 border-green-400/30"
              : "bg-red-900/20 text-red-300 border-red-400/30"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 姓名和邮箱 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="authorName"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              姓名 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="authorName"
              name="authorName"
              value={formData.authorName}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:border-transparent disabled:bg-gray-800 disabled:text-gray-500 text-gray-900 bg-white transition-all ${
                fieldErrors.authorName
                  ? "border-red-400 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
              placeholder="您的姓名"
            />
            {fieldErrors.authorName && (
              <p className="mt-1 text-sm text-red-400">
                {fieldErrors.authorName}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="authorEmail"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              邮箱{" "}
              <span className="text-xs text-gray-400">
                (可选，不会公开显示)
              </span>
            </label>
            <input
              type="email"
              id="authorEmail"
              name="authorEmail"
              value={formData.authorEmail}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:border-transparent disabled:bg-gray-800 disabled:text-gray-500 text-gray-900 bg-white transition-all ${
                fieldErrors.authorEmail
                  ? "border-red-400 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
              placeholder="您的邮箱"
            />
            {fieldErrors.authorEmail && (
              <p className="mt-1 text-sm text-red-400">
                {fieldErrors.authorEmail}
              </p>
            )}
          </div>
        </div>

        {/* 评论内容 */}
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            评论内容 <span className="text-red-400">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:border-transparent disabled:bg-gray-800 disabled:text-gray-500 text-gray-900 bg-white transition-all ${
              fieldErrors.content
                ? "border-red-400 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            }`}
            placeholder="写下您的想法..."
          />
          {fieldErrors.content ? (
            <p className="mt-1 text-sm text-red-400">{fieldErrors.content}</p>
          ) : (
            <p className="mt-1 text-xs text-gray-400">
              请遵守相关法律法规，文明发言。评论将在审核后显示。
            </p>
          )}
        </div>

        {/* 提交按钮 */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={
              !user ||
              isSubmitting ||
              !formData.content.trim() ||
              !formData.authorName.trim() ||
              Object.keys(fieldErrors).length > 0
            }
            className="web3-button px-6 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {!user ? (
              "请先登录"
            ) : isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 bg-gradient-to-r from-blue-400 to-purple-400 mr-2"></div>
                提交中...
              </>
            ) : (
              "提交评论"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
