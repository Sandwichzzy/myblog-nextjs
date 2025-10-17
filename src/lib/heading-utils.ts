/**
 * 标题 ID 生成工具
 * 确保目录组件和文章渲染组件使用相同的 ID 生成逻辑
 */

/**
 * 生成标题 ID
 * 将标题文本转换为 URL 友好的 ID
 */
export function generateHeadingId(text: string): string {
  // 将 React 节点转换为纯文本
  const textContent = typeof text === "string" ? text : String(text);

  return textContent
    .toLowerCase()
    .replace(/\s+/g, "-") // 空格替换为连字符
    .replace(/[^\w\u4e00-\u9fa5-]/g, "") // 只保留字母、数字、中文和连字符
    .replace(/--+/g, "-") // 多个连字符替换为一个
    .replace(/^-|-$/g, ""); // 移除开头和结尾的连字符
}

/**
 * 标题 ID 计数器类
 * 用于在渲染过程中跟踪重复的标题并添加数字后缀
 */
export class HeadingIdCounter {
  private counts = new Map<string, number>();

  /**
   * 获取唯一的标题 ID
   * 如果 ID 重复，自动添加数字后缀
   */
  getUniqueId(text: string): string {
    const baseId = generateHeadingId(text);
    const count = this.counts.get(baseId) || 0;

    let id = baseId;
    if (count > 0) {
      id = `${baseId}-${count}`;
    }

    this.counts.set(baseId, count + 1);
    return id;
  }

  /**
   * 重置计数器
   */
  reset(): void {
    this.counts.clear();
  }
}
