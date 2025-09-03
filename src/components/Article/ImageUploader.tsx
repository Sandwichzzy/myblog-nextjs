"use client";

import { useState, useRef, useCallback } from "react";
import {
  uploadImage,
  compressImage,
  UploadImageResult,
} from "@/lib/image-upload";
import Image from "next/image";

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void;
  onUploadError?: (error: string) => void;
  maxFiles?: number;
  folder?: string;
  className?: string;
}

export default function ImageUploader({
  onUploadSuccess,
  onUploadError,
  maxFiles = 1,
  folder = "articles",
  className = "",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList) => {
      if (files.length === 0) return;

      setUploading(true);
      const uploadPromises: Promise<UploadImageResult>[] = [];

      // 限制上传文件数量
      const filesToUpload = Array.from(files).slice(0, maxFiles);

      for (const file of filesToUpload) {
        try {
          // 压缩图片（可选）
          const compressedFile = await compressImage(file, 1200, 0.8);

          // 创建预览
          const previewUrl = URL.createObjectURL(compressedFile);
          setPreviews((prev) => [...prev, previewUrl]);

          // 上传图片
          const uploadPromise = uploadImage(compressedFile, "images", folder);
          uploadPromises.push(uploadPromise);
        } catch (error) {
          console.error("文件处理失败:", error);
          onUploadError?.(`文件 ${file.name} 处理失败`);
        }
      }

      try {
        const results = await Promise.all(uploadPromises);

        for (const result of results) {
          if (result.success && result.url) {
            onUploadSuccess(result.url);
          } else {
            onUploadError?.(result.error || "上传失败");
          }
        }
      } catch (error) {
        console.error("上传过程中出现错误:", error);
        onUploadError?.("上传过程中出现错误");
      } finally {
        setUploading(false);
        setPreviews([]);
        // 清空文件输入
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [onUploadSuccess, onUploadError, maxFiles, folder]
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
    },
    [handleFiles]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }
          ${uploading ? "opacity-50 cursor-not-allowed" : ""}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={uploading ? undefined : handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={maxFiles > 1}
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
          disabled={uploading}
        />

        {uploading ? (
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="text-sm text-gray-600">上传中...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-2">
            <svg
              className="w-12 h-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-sm text-gray-600">
              <span className="font-medium text-blue-600">点击上传</span>{" "}
              或拖拽图片到此处
            </div>
            <p className="text-xs text-gray-500">
              支持 PNG, JPG, GIF 格式，最大 5MB
              {maxFiles > 1 && ` (最多 ${maxFiles} 个文件)`}
            </p>
          </div>
        )}
      </div>

      {/* 预览区域 */}
      {previews.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative">
              <Image
                src={preview}
                alt={`预览 ${index + 1}`}
                width={200}
                height={150}
                className="w-full h-32 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
