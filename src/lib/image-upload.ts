import { supabase } from "./supabase";

// ============================================================================
// 图片上传和管理工具
// ============================================================================
// 提供图片上传到 Supabase Storage 的功能
// 支持图片压缩、格式转换、URL 生成等
// ============================================================================

export interface UploadImageResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

/**
 * 上传图片到 Supabase Storage
 * @param file 图片文件
 * @param bucket 存储桶名称（默认：'images'）
 * @param folder 文件夹路径（可选）
 * @returns 上传结果
 */
export async function uploadImage(
  file: File,
  bucket: string = "images",
  folder?: string
): Promise<UploadImageResult> {
  try {
    // 验证文件类型
    if (!file.type.startsWith("image/")) {
      return {
        success: false,
        error: "请选择有效的图片文件",
      };
    }

    // 验证文件大小（最大 1MB）
    const maxSize = 1 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        success: false,
        error: "图片文件大小不能超过 1MB",
      };
    }

    // 生成唯一文件名
    const fileExt = file.name.split(".").pop()?.toLowerCase();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${timestamp}_${randomString}.${fileExt}`;

    // 构建文件路径
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // 上传文件到 Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("图片上传失败:", error);
      return {
        success: false,
        error: `上传失败: ${error.message}`,
      };
    }

    // 获取公共访问 URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error("图片上传异常:", error);
    return {
      success: false,
      error: "上传过程中发生异常",
    };
  }
}

/**
 * 删除图片
 * @param path 图片路径
 * @param bucket 存储桶名称
 * @returns 删除结果
 */
export async function deleteImage(
  path: string,
  bucket: string = "images"
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      return {
        success: false,
        error: `删除失败: ${error.message}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("图片删除异常:", error);
    return {
      success: false,
      error: "删除过程中发生异常",
    };
  }
}

/**
 * 获取图片的公共访问 URL
 * @param path 图片路径
 * @param bucket 存储桶名称
 * @returns 公共 URL
 */
export function getImageUrl(path: string, bucket: string = "images"): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return data.publicUrl;
}

/**
 * 压缩图片文件
 * @param file 原始图片文件
 * @param maxWidth 最大宽度
 * @param quality 压缩质量 (0-1)
 * @returns 压缩后的文件
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1200,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      // 计算压缩后的尺寸
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      const width = img.width * ratio;
      const height = img.height * ratio;

      // 设置画布尺寸
      canvas.width = width;
      canvas.height = height;

      // 绘制压缩后的图片
      ctx?.drawImage(img, 0, 0, width, height);

      // 转换为 Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file); // 压缩失败，返回原文件
          }
        },
        file.type,
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
}

/**
 * 验证图片 URL 是否来自 Supabase Storage
 * @param url 图片 URL
 * @returns 是否为有效的 Supabase Storage URL
 */
export function isSupabaseStorageUrl(url: string): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url.startsWith(`${supabaseUrl}/storage/v1/object/public/`);
}

/**
 * 从 Supabase Storage URL 提取文件路径
 * @param url Supabase Storage URL
 * @returns 文件路径
 */
export function extractPathFromUrl(url: string): string | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const prefix = `${supabaseUrl}/storage/v1/object/public/images/`;

  if (url.startsWith(prefix)) {
    return url.substring(prefix.length);
  }

  return null;
}
