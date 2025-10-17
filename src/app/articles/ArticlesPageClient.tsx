"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArticleCard, SearchAndFilter, Pagination } from "@/components";
import { ArticleForDisplay } from "@/types/database";

interface Tag {
  name: string;
  color: string;
  count: number;
}

export function ArticlesPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [articles, setArticles] = useState<ArticleForDisplay[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  // 使用 ref 追踪上一次的查询参数，避免重复请求
  const prevParamsRef = useRef<string>("");

  // 获取文章数据
  const fetchArticles = async (
    page: number = 1,
    search: string = "",
    tag: string = ""
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        ...(search && { search }),
        ...(tag && { tag }),
      });

      const response = await fetch(`/api/articles?${params}`);
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
      const response = await fetch(`/api/tags`);
      const data = await response.json();

      if (data.success) {
        setTags(data.data);
      }
    } catch (error) {
      console.error("获取标签失败:", error);
    }
  };

  // 初始化标签数据（只执行一次）
  useEffect(() => {
    fetchTags();
  }, []);

  // 监听 URL 参数变化
  useEffect(() => {
    const tag = searchParams.get("tag") || "";
    const query = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");

    // 创建当前参数的唯一标识
    const currentParams = `${page}-${query}-${tag}`;

    // 只有当参数真正变化时才执行
    if (currentParams !== prevParamsRef.current) {
      prevParamsRef.current = currentParams;

      // 同步 UI 状态
      setCurrentPage(page);
      setSearchQuery(query);
      setSelectedTag(tag);

      // 获取数据
      fetchArticles(page, query, tag);
    }
  }, [searchParams]); // 只依赖 searchParams 对象

  // 更新 URL 参数
  const updateURL = (page: number, search: string, tag: string) => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", page.toString());
    if (search) params.set("search", search);
    if (tag) params.set("tag", tag);

    const queryString = params.toString();
    const newURL = queryString ? `/articles?${queryString}` : "/articles";

    router.push(newURL, { scroll: false });
  };

  // 处理搜索
  const handleSearch = (query: string) => {
    updateURL(1, query, selectedTag);
  };

  // 处理标签筛选
  const handleTagFilter = (tag: string) => {
    updateURL(1, searchQuery, tag);
  };

  // 处理分页
  const handlePageChange = (page: number) => {
    updateURL(page, searchQuery, selectedTag);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 处理标签刷新
  const handleRefreshTags = () => {
    fetchTags();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* 背景装饰效果 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                className="web3-card p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-600 rounded mb-4"></div>
                <div className="h-3 bg-gray-600 rounded mb-2"></div>
                <div className="h-3 bg-gray-600 rounded mb-4"></div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 w-12 bg-gray-600 rounded"></div>
                  <div className="h-6 w-16 bg-gray-600 rounded"></div>
                </div>
                <div className="h-3 bg-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        ) : articles.length > 0 ? (
          <>
            {/* 文章数量统计 */}
            <div className="mb-6">
              <p className="text-sm text-gray-300">
                共找到{" "}
                <span className="neon-text font-semibold">{totalCount}</span>{" "}
                篇文章
                {selectedTag && (
                  <span className="ml-2 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs rounded-full shadow-lg">
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
            <div className="text-6xl mb-4 animate-bounce">
              <span className="gradient-text">📝</span>
            </div>
            <h3 className="text-2xl font-semibold mb-2">
              <span className="gradient-text">暂无文章</span>
            </h3>
            <p className="text-gray-300 mb-6 text-lg">
              {searchQuery || selectedTag
                ? "没有找到符合条件的文章"
                : "还没有发布任何文章"}
            </p>
            {(searchQuery || selectedTag) && (
              <button
                onClick={() => {
                  updateURL(1, "", "");
                }}
                className="web3-button px-8 py-3 text-lg font-semibold uppercase tracking-wide"
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
