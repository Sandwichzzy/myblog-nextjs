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
    <div className="web3-card p-8 mb-8 animate-fade-in-up">
      {/* 搜索框 */}
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"></div>
        <input
          type="text"
          placeholder="搜索Web3技术文章..."
          className="web3-input w-full pl-12 pr-4 py-4 text-lg placeholder-gray-500"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        {/* 搜索框发光效果 */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 focus-within:opacity-100 transition-opacity pointer-events-none"></div>
      </div>

      {/* 标签筛选 */}
      {availableTags.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center">
              <svg
                className="w-5 h-5 mr-2 neon-text-purple"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              <span className="gradient-text">技术标签</span>
            </h3>
            {onRefreshTags && (
              <button
                onClick={onRefreshTags}
                className="text-sm text-gray-400 hover:text-white hover:neon-text transition-all duration-300 flex items-center group"
              >
                <svg
                  className="w-4 h-4 mr-1 group-hover:animate-spin"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                刷新
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onTagFilter("")}
              className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 relative overflow-hidden group ${
                !selectedTag
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg animate-neon-pulse"
                  : "bg-gradient-to-r from-gray-700 to-gray-600 text-gray-300 hover:from-gray-600 hover:to-gray-500 hover:text-white"
              }`}
            >
              <span className="relative z-10 flex items-center">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                全部文章
              </span>
              {!selectedTag && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-pulse"></div>
              )}
            </button>

            {availableTags.map((tag) => (
              <button
                key={tag.name}
                onClick={() => handleTagClick(tag.name)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 relative overflow-hidden group hover:scale-105 ${
                  selectedTag === tag.name
                    ? "text-white shadow-lg animate-neon-pulse"
                    : "hover:shadow-md hover:text-white"
                }`}
                style={
                  selectedTag === tag.name
                    ? {
                        backgroundColor: tag.color,
                        boxShadow: `0 0 20px ${tag.color}40`,
                      }
                    : {
                        backgroundColor: `${tag.color}20`,
                        color: tag.color,
                        border: `1px solid ${tag.color}40`,
                      }
                }
              >
                <span className="relative z-10 flex items-center">
                  #{tag.name}
                  <span className="ml-2 px-2 py-0.5 text-xs bg-black/20 rounded-full">
                    {tag.count}
                  </span>
                </span>
                {selectedTag === tag.name && (
                  <div
                    className="absolute inset-0 animate-pulse"
                    style={{ backgroundColor: `${tag.color}20` }}
                  ></div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 当前筛选状态 */}
      {(searchQuery || selectedTag) && (
        <div className="mt-8 pt-6 border-t border-blue-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-400 flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z"
                  />
                </svg>
                当前筛选：
              </span>
              {searchQuery && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30">
                  <svg
                    className="w-3 h-3 mr-1"
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
                  &ldquo;{searchQuery}&rdquo;
                </span>
              )}
              {selectedTag && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  #{selectedTag}
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setSearchQuery("");
                onSearch("");
                onTagFilter("");
              }}
              className="text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 px-4 py-2 rounded-lg transition-all duration-300 flex items-center group"
            >
              <svg
                className="w-4 h-4 mr-1 group-hover:animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              清除筛选
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
