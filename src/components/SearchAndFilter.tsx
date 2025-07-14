"use client";

import { useState, useEffect } from "react";
import { debounce } from "@/lib/utils";

interface SearchAndFilterProps {
  onSearch: (query: string) => void;
  onTagFilter: (tag: string) => void;
  selectedTag?: string;
  availableTags?: Array<{ name: string; color: string; count: number }>;
  onRefreshTags?: () => void;
}

export default function SearchAndFilter({
  onSearch,
  onTagFilter,
  selectedTag,
  availableTags = [],
  onRefreshTags,
}: SearchAndFilterProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // 防抖搜索
  const debouncedSearch = debounce((query: string) => {
    onSearch(query);
  }, 300);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleTagClick = (tagName: string) => {
    if (selectedTag === tagName) {
      onTagFilter(""); // 取消选择
    } else {
      onTagFilter(tagName);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
      {/* 搜索框 */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          placeholder="搜索文章..."
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      {/* 标签筛选 */}
      {availableTags.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">标签筛选</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onTagFilter("")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedTag
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              全部
            </button>
            {availableTags.map((tag) => (
              <button
                key={tag.name}
                onClick={() => handleTagClick(tag.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTag === tag.name
                    ? "text-white shadow-md"
                    : "hover:shadow-sm"
                }`}
                style={
                  selectedTag === tag.name
                    ? { backgroundColor: tag.color }
                    : {
                        backgroundColor: tag.color + "20",
                        color: tag.color,
                        border: `1px solid ${tag.color}40`,
                      }
                }
              >
                {tag.name}
                <span className="ml-2 text-xs opacity-75">({tag.count})</span>
              </button>
            ))}
            {onRefreshTags && (
              <button
                onClick={onRefreshTags}
                className="px-4 py-2 rounded-full text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                刷新标签
              </button>
            )}
          </div>
        </div>
      )}

      {/* 当前筛选状态 */}
      {(searchQuery || selectedTag) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              当前筛选：
              {searchQuery && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  搜索: &ldquo;{searchQuery}&rdquo;
                </span>
              )}
              {selectedTag && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  标签: {selectedTag}
                </span>
              )}
            </span>
            <button
              onClick={() => {
                setSearchQuery("");
                onSearch("");
                onTagFilter("");
              }}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              清除筛选
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
