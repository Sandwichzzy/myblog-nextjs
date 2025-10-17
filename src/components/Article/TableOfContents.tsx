"use client";

import { useEffect, useState } from "react";
import { generateHeadingId } from "@/lib/heading-utils";

/**
 * 目录项接口
 */
interface TocItem {
  id: string; // 标题ID，用于滚动定位
  text: string; // 标题文本
  level: number; // 标题等级 (1-6)
}

interface TableOfContentsProps {
  content: string; // Markdown 内容
}

/**
 * 文章目录组件
 * 功能：
 * 1. 自动从 Markdown 内容中提取标题生成目录
 * 2. 点击目录项平滑滚动到对应位置
 * 3. 滚动时高亮当前所在位置的目录项
 */
export function TableOfContents({ content }: TableOfContentsProps) {
  const [tocItems, setTocItems] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  // 从 Markdown 内容中提取标题
  useEffect(() => {
    const headings = extractHeadings(content);
    setTocItems(headings);
  }, [content]);

  // 监听滚动，高亮当前位置的目录项
  useEffect(() => {
    if (tocItems.length === 0) return;

    const handleScroll = () => {
      // 获取所有标题元素
      const headingElements = tocItems
        .map((item) => {
          const element = document.getElementById(item.id);
          if (element) {
            const rect = element.getBoundingClientRect();
            return {
              id: item.id,
              top: rect.top,
            };
          }
          return null;
        })
        .filter(Boolean) as { id: string; top: number }[];

      // 找到当前视口中最接近顶部的标题
      // 考虑一个偏移量（100px），这样标题不需要完全到达顶部就会高亮
      const current = headingElements.find((heading) => heading.top >= -100);

      if (current) {
        setActiveId(current.id);
      } else if (headingElements.length > 0) {
        // 如果没有找到，说明已经滚动到最后，高亮最后一个
        setActiveId(headingElements[headingElements.length - 1].id);
      }
    };

    // 初始化时执行一次
    handleScroll();

    // 添加滚动监听，使用节流优化性能
    let ticking = false;
    const scrollListener = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", scrollListener, { passive: true });

    return () => {
      window.removeEventListener("scroll", scrollListener);
    };
  }, [tocItems]);

  // 点击目录项，平滑滚动到对应位置
  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offsetTop = element.offsetTop - 100; // 留出一些顶部空间
      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  };

  if (tocItems.length === 0) {
    return null;
  }

  return (
    <nav className="sticky top-8">
      <div className="web3-card p-6 max-h-[calc(100vh-6rem)] flex flex-col">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center flex-shrink-0">
          <svg
            className="w-5 h-5 mr-2 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h7"
            />
          </svg>
          <span className="gradient-text">目录</span>
        </h3>

        {/* 可滚动的目录列表 */}
        <ul className="space-y-2 text-sm overflow-y-auto overflow-x-hidden pr-2">
          {tocItems.map((item) => {
            const isActive = activeId === item.id;
            const paddingLeft = `${(item.level - 1) * 1}rem`; // 根据标题等级缩进

            return (
              <li key={item.id} style={{ paddingLeft }}>
                <button
                  onClick={() => scrollToHeading(item.id)}
                  className={`
                    text-left w-full py-1.5 px-3 rounded-md transition-all duration-200
                    hover:bg-blue-500/10 hover:text-blue-300
                    ${
                      isActive
                        ? "text-blue-400 bg-blue-500/20 border-l-2 border-blue-400 font-medium"
                        : "text-gray-300 border-l-2 border-transparent"
                    }
                  `}
                  aria-label={`跳转到 ${item.text}`}
                >
                  <span className="line-clamp-2">{item.text}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

/**
 * 从 Markdown 内容中提取标题
 */
function extractHeadings(markdown: string): TocItem[] {
  const headings: TocItem[] = [];
  const idCounts = new Map<string, number>(); // 跟踪每个 ID 出现的次数

  // 匹配 Markdown 标题的正则表达式
  // 支持 ATX 风格：# Heading 或 ## Heading
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;

  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length; // # 的数量表示标题等级
    let text = match[2].trim();

    // 移除标题中的 Markdown 语法（如链接、加粗等）
    text = text
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // 移除链接，保留文本
      .replace(/[*_~`]/g, "") // 移除加粗、斜体、删除线、行内代码
      .trim();

    // 生成基础 ID：将文本转为 URL 友好的格式
    const baseId = generateHeadingId(text);

    // 处理重复的 ID：如果 ID 已存在，添加数字后缀
    const count = idCounts.get(baseId) || 0;
    const id = count > 0 ? `${baseId}-${count}` : baseId;
    idCounts.set(baseId, count + 1);

    headings.push({
      id,
      text,
      level,
    });
  }

  return headings;
}
