import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// 合并 className 工具函数
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 格式化日期函数
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return dateObj.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// 格式化相对时间
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return "今天";
  } else if (diffInDays === 1) {
    return "昨天";
  } else if (diffInDays < 30) {
    return `${diffInDays}天前`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months}个月前`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `${years}年前`;
  }
}

// 计算阅读时间
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200; // 中文阅读速度约为每分钟200字
  const wordCount = content.length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return readingTime;
}

// 截断文本
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + "...";
}

// 生成随机颜色
export function generateRandomColor(): string {
  const colors = [
    "#3B82F6", // blue
    "#10B981", // green
    "#F59E0B", // yellow
    "#EF4444", // red
    "#8B5CF6", // purple
    "#06B6D4", // cyan
    "#F97316", // orange
    "#84CC16", // lime
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// 防抖函数
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
