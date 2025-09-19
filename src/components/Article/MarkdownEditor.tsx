"use client";

import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeRaw from "rehype-raw";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import ImageUploader from "./ImageUploader";
import Image from "next/image";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: string;
  className?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = "请输入文章内容...",
  height = "h-96",
  className = "",
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [showImageUploader, setShowImageUploader] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 插入文本到光标位置
  const insertText = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + text + value.substring(end);

    onChange(newValue);

    // 重新设置光标位置
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  // 处理图片上传成功
  const handleImageUpload = (url: string) => {
    const imageMarkdown = `![图片描述](${url})`;
    insertText(imageMarkdown);
    setShowImageUploader(false);
  };

  // 处理图片上传错误
  const handleImageUploadError = (error: string) => {
    alert(`图片上传失败: ${error}`);
  };

  // 工具栏按钮
  const toolbarButtons = [
    {
      label: "粗体",
      icon: "B",
      action: () => insertText("**粗体文字**"),
    },
    {
      label: "斜体",
      icon: "I",
      action: () => insertText("*斜体文字*"),
    },
    {
      label: "标题",
      icon: "H",
      action: () => insertText("## 标题"),
    },
    {
      label: "链接",
      icon: "🔗",
      action: () => insertText("[链接文字](https://example.com)"),
    },
    {
      label: "代码块",
      icon: "</>",
      action: () => insertText("```javascript\n代码内容\n```"),
    },
    {
      label: "行内数学公式",
      icon: "$",
      action: () => insertText("$E=mc^2$"),
    },
    {
      label: "块级数学公式",
      icon: "$$",
      action: () =>
        insertText(
          "$$\n\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}\n$$"
        ),
    },
    {
      label: "表格",
      icon: "📊",
      action: () =>
        insertText(
          "| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 内容 | 内容 | 内容 |"
        ),
    },
    {
      label: "引用",
      icon: "❝",
      action: () => insertText("> 引用内容"),
    },
    {
      label: "列表",
      icon: "•",
      action: () => insertText("- 列表项1\n- 列表项2\n- 列表项3"),
    },
  ];

  return (
    <div
      className={`border border-gray-300 rounded-lg overflow-hidden ${className}`}
    >
      {/* 工具栏 */}
      <div className="border-b border-gray-200 bg-gray-50 p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {toolbarButtons.map((button, index) => (
              <button
                key={index}
                onClick={button.action}
                className="px-2 py-1 text-sm rounded hover:bg-gray-200 transition-colors"
                title={button.label}
                type="button"
              >
                {button.icon}
              </button>
            ))}
            <div className="w-px h-6 bg-gray-300 mx-2" />
            <button
              onClick={() => setShowImageUploader(!showImageUploader)}
              className="px-2 py-1 text-sm rounded hover:bg-gray-200 transition-colors"
              title="插入图片"
              type="button"
            >
              🖼️
            </button>
          </div>

          {/* 编辑/预览切换 */}
          <div className="flex rounded-md border border-gray-300 overflow-hidden">
            <button
              onClick={() => setActiveTab("edit")}
              className={`px-3 py-1 text-sm ${
                activeTab === "edit"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
              type="button"
            >
              编辑
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-3 py-1 text-sm ${
                activeTab === "preview"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
              type="button"
            >
              预览
            </button>
          </div>
        </div>

        {/* 图片上传器 */}
        {showImageUploader && (
          <div className="mt-3 p-3 bg-white rounded border">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">上传图片</h4>
              <button
                onClick={() => setShowImageUploader(false)}
                className="text-gray-400 hover:text-gray-600"
                type="button"
              >
                ✕
              </button>
            </div>
            <ImageUploader
              onUploadSuccess={handleImageUpload}
              onUploadError={handleImageUploadError}
              folder="articles"
              className="max-w-sm"
            />
          </div>
        )}
      </div>

      {/* 编辑器内容区域 */}
      <div className={`${height} overflow-hidden`}>
        {activeTab === "edit" ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full p-4 border-none outline-none resize-none font-mono text-sm leading-relaxed text-gray-900 bg-white"
          />
        ) : (
          <div className="h-full overflow-y-auto p-4 bg-gray-900">
            <div
              className="prose prose-xl max-w-none 
              prose-headings:text-gray-100 prose-headings:font-bold
              prose-p:text-gray-200 prose-p:leading-relaxed prose-p:mb-4 
              prose-a:text-blue-400 prose-a:no-underline hover:prose-a:text-blue-300 hover:prose-a:underline 
              prose-strong:text-white prose-strong:font-semibold
              prose-blockquote:text-gray-300 prose-blockquote:border-blue-400 prose-blockquote:bg-blue-900/20 prose-blockquote:rounded-r
              prose-li:text-gray-200 prose-li:my-1
              prose-code:text-pink-400 prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:border prose-pre:border-gray-700
              prose-th:text-gray-100 prose-th:bg-gray-800 prose-th:border-gray-600
              prose-td:text-gray-200 prose-td:border-gray-600
              prose-hr:border-gray-600
              prose-ul:text-gray-200 prose-ul:list-disc prose-ul:pl-6
              prose-ol:text-gray-200 prose-ol:list-decimal prose-ol:pl-6
              [&_li]:relative [&_li]:pl-0 [&_li::marker]:text-gray-400 [&_li::marker]:font-normal"
              style={{
                listStylePosition: "outside",
              }}
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeRaw, rehypeKatex]}
                components={{
                  // 自定义图片渲染
                  img: ({ src, alt, ...props }) => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { width, height, ...restProps } = props;
                    const imageSrc = src as string;

                    if (!imageSrc || imageSrc.trim() === "") {
                      return (
                        <span className="block my-4 p-4 bg-gray-800 rounded-lg text-center text-gray-400">
                          <span className="block">图片路径为空</span>
                          {alt && (
                            <span className="block text-sm mt-1 italic">
                              {alt}
                            </span>
                          )}
                        </span>
                      );
                    }

                    const isValidUrl = (url: string) => {
                      try {
                        new URL(url);
                        return true;
                      } catch {
                        return (
                          url.startsWith("/") ||
                          url.startsWith("./") ||
                          url.startsWith("../")
                        );
                      }
                    };

                    if (!isValidUrl(imageSrc)) {
                      return (
                        <span className="block my-4 p-4 bg-gray-800 rounded-lg text-center text-gray-400">
                          <span className="block">
                            图片加载失败: {imageSrc}
                          </span>
                          {alt && (
                            <span className="block text-sm mt-1 italic">
                              {alt}
                            </span>
                          )}
                        </span>
                      );
                    }

                    return (
                      <span className="block my-4">
                        <Image
                          src={imageSrc}
                          alt={(alt as string) || ""}
                          width={600}
                          height={400}
                          className="rounded-lg shadow-md w-full h-auto"
                          {...restProps}
                        />
                        {alt && (
                          <span className="block text-sm text-gray-400 text-center mt-2 italic">
                            {alt}
                          </span>
                        )}
                      </span>
                    );
                  },
                  // 自定义代码块渲染
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  code: ({ inline, className, children, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || "");
                    const language = match ? match[1] : "";

                    return !inline ? (
                      <SyntaxHighlighter
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        style={tomorrow as any}
                        language={language}
                        PreTag="pre"
                        className="rounded-lg my-4"
                        {...props}
                      >
                        {String(children).replace(/\n$/, "")}
                      </SyntaxHighlighter>
                    ) : (
                      <code
                        className="bg-gray-800 text-pink-400 px-1 py-0.5 rounded text-sm"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {value || "暂无内容..."}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
