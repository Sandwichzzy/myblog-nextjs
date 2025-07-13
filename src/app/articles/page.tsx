"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ArticleCard from "@/components/ArticleCard";
import SearchAndFilter from "@/components/SearchAndFilter";
import Pagination from "@/components/Pagination";
import { ArticleForDisplay } from "@/types/database";

interface Tag {
  name: string;
  color: string;
  count: number;
}

function ArticlesPageContent() {
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
        limit: "9",
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
  const fetchTags = async () => {
    try {
      const response = await fetch("/api/tags");
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
    fetchTags();
  }, []);

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面标题 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">文章列表</h1>
          <p className="mt-2 text-gray-600">
            {totalCount > 0 ? `共找到 ${totalCount} 篇文章` : "暂无文章"}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索和筛选 */}
        <SearchAndFilter
          onSearch={handleSearch}
          onTagFilter={handleTagFilter}
          selectedTag={selectedTag}
          availableTags={tags}
        />

        {/* 文章列表 */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              暂无文章
            </h3>
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
    </div>
  );
}

export default function ArticlesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50">
          <div className="bg-white border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <h1 className="text-3xl font-bold text-gray-900">文章列表</h1>
              <p className="mt-2 text-gray-600">加载中...</p>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">加载中...</p>
            </div>
          </div>
        </div>
      }
    >
      <ArticlesPageContent />
    </Suspense>
  );
}
