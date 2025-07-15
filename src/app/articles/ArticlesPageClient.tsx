"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ArticleCard, SearchAndFilter, Pagination } from "@/components";
import { ArticleForDisplay } from "@/types/database";

interface Tag {
  name: string;
  color: string;
  count: number;
}

export function ArticlesPageClient() {
  const searchParams = useSearchParams();
  const [articles, setArticles] = useState<ArticleForDisplay[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  // 从URL参数获取初始筛选条件
  useEffect(() => {
    const tag = searchParams.get("tag");
    const query = searchParams.get("search");
    const page = searchParams.get("page");
    const refresh = searchParams.get("refresh");

    // 使用URL参数的值，而不是状态值
    const currentTag = tag || "";
    const currentQuery = query || "";
    const currentPageNum = page ? parseInt(page) : 1;

    if (tag) setSelectedTag(tag);
    if (query) setSearchQuery(query);
    if (page) setCurrentPage(currentPageNum);

    // 如果有refresh参数，立即刷新数据（使用URL参数的值）
    if (refresh) {
      fetchArticles(currentPageNum, currentQuery, currentTag, true);
      // 清除URL中的refresh参数
      const url = new URL(window.location.href);
      url.searchParams.delete("refresh");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  // 获取文章数据
  const fetchArticles = async (
    page: number = 1,
    search: string = "",
    tag: string = "",
    forceRefresh: boolean = false
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        ...(search && { search }),
        ...(tag && { tag }),
        // 添加时间戳参数来绕过缓存
        ...(forceRefresh && { _t: Date.now().toString() }),
      });

      const response = await fetch(`/api/articles?${params}`, {
        // 强制刷新时不使用缓存
        cache: forceRefresh ? "no-cache" : "default",
      });
      const data = await response.json();

      if (data.success) {
        setArticles(data.data);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalCount);
      }
    } catch (error) {
      console.error("获取文章失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 获取标签数据
  const fetchTags = async (forceRefresh: boolean = false) => {
    try {
      const params = new URLSearchParams();
      if (forceRefresh) {
        params.set("nocache", "true");
        params.set("_t", Date.now().toString());
      }

      const response = await fetch(`/api/tags?${params}`, {
        cache: forceRefresh ? "no-cache" : "default",
      });
      const data = await response.json();

      if (data.success) {
        setTags(data.data);
      }
    } catch (error) {
      console.error("获取标签失败:", error);
    }
  };

  // 初始化数据
  useEffect(() => {
    // 检查是否从管理页面返回或有refresh参数
    const fromAdmin = document.referrer.includes("/admin");
    const hasRefresh = searchParams.get("refresh") !== null;
    const shouldForceRefresh = fromAdmin || hasRefresh;

    fetchTags(shouldForceRefresh);

    if (hasRefresh) {
      // 清除URL中的refresh参数
      const url = new URL(window.location.href);
      url.searchParams.delete("refresh");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  // 当筛选条件改变时重新获取数据
  useEffect(() => {
    fetchArticles(currentPage, searchQuery, selectedTag);
  }, [currentPage, searchQuery, selectedTag]);

  // 处理搜索
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // 处理标签筛选
  const handleTagFilter = (tag: string) => {
    setSelectedTag(tag);
    setCurrentPage(1);
  };

  // 处理分页
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 处理标签刷新
  const handleRefreshTags = () => {
    fetchTags(true); // 强制刷新标签
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 搜索和筛选 */}
      <SearchAndFilter
        onSearch={handleSearch}
        onTagFilter={handleTagFilter}
        selectedTag={selectedTag}
        availableTags={tags}
        onRefreshTags={handleRefreshTags}
      />

      {/* 文章列表 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={`skeleton-${index}`}
              className="bg-white rounded-lg shadow-sm p-6"
            >
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="flex gap-2 mb-4">
                <div className="h-6 w-12 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      ) : articles.length > 0 ? (
        <>
          {/* 文章数量统计 */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              共找到 {totalCount} 篇文章
              {selectedTag && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {selectedTag}
                </span>
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {/* 分页 */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">暂无文章</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || selectedTag
              ? "没有找到符合条件的文章"
              : "还没有发布任何文章"}
          </p>
          {(searchQuery || selectedTag) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedTag("");
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              清除筛选条件
            </button>
          )}
        </div>
      )}
    </div>
  );
}
