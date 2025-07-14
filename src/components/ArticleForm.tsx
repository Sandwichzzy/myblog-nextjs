"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { createArticleSchema, updateArticleSchema } from "@/lib/validations";
import type { ArticleWithTags } from "@/types/database";
import { z } from "zod";

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface ArticleFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  published: boolean;
  tagIds: string[];
}

interface ArticleFormProps {
  article?: ArticleWithTags | null;
  mode?: "create" | "edit";
}

export default function ArticleForm({
  article,
  mode = "create",
}: ArticleFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // 表单数据状态
  const [formData, setFormData] = useState<ArticleFormData>({
    title: article?.title || "",
    slug: article?.slug || "",
    content: article?.content || "",
    excerpt: article?.excerpt || "",
    published: article?.published || false,
    tagIds: article?.tags?.map((t: { tag: { id: string } }) => t.tag.id) || [],
  });

  // 加载可用标签
  useEffect(() => {
    const fetchTags = async () => {
      try {
        // 添加强制刷新参数，确保获取最新标签
        const params = new URLSearchParams({
          nocache: "true",
          _t: Date.now().toString(),
        });

        const response = await fetch(`/api/tags?${params}`, {
          cache: "no-cache",
        });
        const result = await response.json();
        if (result.success) {
          setAvailableTags(result.data);
        } else {
          console.error("获取标签失败:", result);
        }
      } catch (error) {
        console.error("加载标签失败:", error);
      }
    };

    fetchTags();
  }, []);

  // 处理输入变化
  const handleInputChange = (
    field: keyof ArticleFormData,
    value: string | boolean | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // 清除该字段的错误状态
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // 处理标签选择
  const handleTagToggle = (tagId: string) => {
    // 防护措施：检查tagId是否有效
    if (!tagId) {
      console.error("tagId is undefined or empty:", tagId);
      return;
    }

    const isSelected = formData.tagIds.includes(tagId);
    const newTagIds = isSelected
      ? formData.tagIds.filter((id) => id !== tagId)
      : [...formData.tagIds, tagId];

    handleInputChange("tagIds", newTagIds);
  };

  // 使用 Zod 验证表单
  const validateForm = () => {
    try {
      const schema =
        mode === "create" ? createArticleSchema : updateArticleSchema;
      schema.parse(formData);
      setError(null);
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
        setError(firstError.message);
      } else {
        setError("表单验证失败");
      }
      return false;
    }
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const url =
        mode === "create" ? "/api/articles" : `/api/articles/${article?.slug}`;

      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(mode === "create" ? "文章创建成功！" : "文章更新成功！");

        // 延迟跳转，让用户看到成功消息
        setTimeout(() => {
          if (mode === "create") {
            // 添加时间戳参数强制刷新缓存
            router.push(`/articles?refresh=${Date.now()}`);
          } else {
            router.push(`/articles/${result.data.slug}`);
          }
        }, 1500);
      } else {
        setError(result.message || "操作失败");
      }
    } catch (error) {
      console.error("提交失败:", error);
      setError("提交失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {/* 错误和成功消息 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        {/* 标题 */}
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            文章标题 *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:border-transparent ${
              fieldErrors.title
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="请输入文章标题"
          />
          {fieldErrors.title && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.title}</p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label
            htmlFor="slug"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            URL 标识符 (Slug) *
          </label>
          <input
            type="text"
            id="slug"
            value={formData.slug}
            onChange={(e) => handleInputChange("slug", e.target.value)}
            className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:border-transparent ${
              fieldErrors.slug
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="url-friendly-slug"
          />
          {fieldErrors.slug ? (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.slug}</p>
          ) : (
            <p className="mt-1 text-sm text-gray-500">
              只能包含小写字母、数字和连字符，用于生成 SEO 友好的 URL
            </p>
          )}
        </div>

        {/* 摘要 */}
        <div>
          <label
            htmlFor="excerpt"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            文章摘要
          </label>
          <textarea
            id="excerpt"
            value={formData.excerpt}
            onChange={(e) => handleInputChange("excerpt", e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="简短描述文章内容..."
          />
        </div>

        {/* 标签选择 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            文章标签（支持多选）
          </label>
          {availableTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                // 每个标签独立判断选中状态
                const isSelected = formData.tagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={`px-3 py-1 rounded-full text-sm border transition-all duration-200 ${
                      isSelected
                        ? "text-white font-medium shadow-sm"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    style={{
                      backgroundColor: isSelected ? tag.color : "transparent",
                      borderColor: isSelected ? tag.color : "#d1d5db",
                    }}
                  >
                    {isSelected && <span className="mr-1">✓</span>}
                    {tag.name}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-gray-500 text-sm">
              加载标签中... 如果标签未显示，请确认您已在{" "}
              <a
                href="/admin/tags"
                className="text-blue-600 hover:text-blue-800"
              >
                标签管理
              </a>{" "}
              中创建了标签。
            </div>
          )}
          {formData.tagIds.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              已选择 {formData.tagIds.length} 个标签：
              {availableTags
                .filter((tag) => formData.tagIds.includes(tag.id))
                .map((tag) => tag.name)
                .join("、")}
            </div>
          )}
        </div>

        {/* 内容编辑器 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              文章内容 * (支持 Markdown)
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setIsPreview(false)}
                className={`px-3 py-1 text-sm rounded ${
                  !isPreview
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                编辑
              </button>
              <button
                type="button"
                onClick={() => setIsPreview(true)}
                className={`px-3 py-1 text-sm rounded ${
                  isPreview
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                预览
              </button>
            </div>
          </div>

          <div
            className={`border rounded-md ${
              fieldErrors.content ? "border-red-300" : "border-gray-300"
            }`}
          >
            {!isPreview ? (
              <textarea
                value={formData.content}
                onChange={(e) => handleInputChange("content", e.target.value)}
                rows={20}
                className={`w-full px-4 py-3 border-0 rounded-md resize-none focus:ring-2 focus:border-transparent ${
                  fieldErrors.content
                    ? "focus:ring-red-500"
                    : "focus:ring-blue-500"
                }`}
                placeholder="在这里撰写你的文章内容... 支持 Markdown 语法"
              />
            ) : (
              <div className="min-h-[500px] p-4 prose prose-lg max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    code: ({ inline, className, children, ...props }: any) => {
                      const match = /language-(\w+)/.exec(className || "");
                      const language = match ? match[1] : "";

                      return !inline ? (
                        <SyntaxHighlighter
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          style={tomorrow as any}
                          language={language}
                          PreTag="div"
                          className="rounded-lg my-4"
                          {...props}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code
                          className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {formData.content || "*预览内容将在这里显示...*"}
                </ReactMarkdown>
              </div>
            )}
          </div>
          {fieldErrors.content && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.content}</p>
          )}
        </div>

        {/* 发布设置 */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="published"
            checked={formData.published}
            onChange={(e) => handleInputChange("published", e.target.checked)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="published"
            className="text-sm font-medium text-gray-700"
          >
            立即发布文章
          </label>
        </div>

        {/* 提交按钮 */}
        <div className="flex items-center space-x-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? "保存中..."
              : mode === "create"
              ? "创建文章"
              : "更新文章"}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            取消
          </button>
        </div>
      </form>
    </div>
  );
}
