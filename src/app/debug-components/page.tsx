"use client";

import { useState } from "react";
import { MarkdownEditor, ImageUploader, ArticleForm } from "@/components";

export default function DebugComponentsPage() {
  const [content, setContent] = useState("# 测试内容\n\n这是一个测试。");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">组件诊断页面</h1>

        <div className="space-y-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">MarkdownEditor 测试</h2>
            <MarkdownEditor
              value={content}
              onChange={setContent}
              placeholder="测试编辑器..."
              height="h-[300px]"
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">ImageUploader 测试</h2>
            <ImageUploader
              onUploadSuccess={(url) => console.log("上传成功:", url)}
              onUploadError={(error) => console.log("上传失败:", error)}
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-4">组件状态</h2>
            <div className="space-y-2 text-sm">
              <div>✅ MarkdownEditor: 已加载</div>
              <div>✅ ImageUploader: 已加载</div>
              <div>✅ ArticleForm: 已加载</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
