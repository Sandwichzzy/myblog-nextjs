import { supabase, supabaseAdmin } from "./supabase";
import {
  Article,
  ArticleInsert,
  ArticleUpdate,
  ArticleWithTags,
} from "@/types/database";

// 获取已发布文章列表（带分页）
export async function getPublishedArticles(
  page: number = 1,
  limit: number = 10,
  tagFilter?: string
) {
  let query = supabase
    .from("articles")
    .select(
      `
      *,
      tags:article_tags(
        tag:tags(*)
      )
    `
    )
    .eq("published", true)
    .order("created_at", { ascending: false });

  // 如果有标签筛选
  if (tagFilter) {
    query = query.contains("tags.tag.name", [tagFilter]);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query
    .range(from, to)
    .returns<ArticleWithTags[]>();

  if (error) {
    throw new Error(`Failed to fetch articles: ${error.message}`);
  }

  return {
    articles: data || [],
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
    currentPage: page,
  };
}

// 通过slug获取文章详情
export async function getArticleBySlug(
  slug: string
): Promise<ArticleWithTags | null> {
  const { data, error } = await supabase
    .from("articles")
    .select(
      `
      *,
      tags:article_tags(
        tag:tags(*)
      )
    `
    )
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // 文章不存在
    }
    throw new Error(`Failed to fetch article: ${error.message}`);
  }

  return data as ArticleWithTags;
}

// 增加文章浏览量
export async function incrementViewCount(articleId: string) {
  const { error } = await supabase.rpc("increment_view_count", {
    article_id: articleId,
  });

  if (error) {
    console.error("Failed to increment view count:", error);
  }
}

// 创建文章（管理员功能）
export async function createArticle(
  articleData: ArticleInsert
): Promise<Article> {
  const { data, error } = await supabaseAdmin
    .from("articles")
    .insert(articleData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create article: ${error.message}`);
  }

  return data;
}

// 更新文章（管理员功能）
export async function updateArticle(
  id: string,
  updates: ArticleUpdate
): Promise<Article> {
  const { data, error } = await supabaseAdmin
    .from("articles")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update article: ${error.message}`);
  }

  return data;
}

// 删除文章（管理员功能）
export async function deleteArticle(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("articles").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete article: ${error.message}`);
  }
}

// 搜索文章
export async function searchArticles(
  query: string,
  page: number = 1,
  limit: number = 10
) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabase
    .from("articles")
    .select(
      `
      *,
      tags:article_tags(
        tag:tags(*)
      )
    `
    )
    .eq("published", true)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`Failed to search articles: ${error.message}`);
  }

  return {
    articles: data || [],
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
    currentPage: page,
  };
}

// 获取所有文章（管理员功能）
export async function getAllArticles(page: number = 1, limit: number = 10) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await supabaseAdmin
    .from("articles")
    .select(
      `
      *,
      tags:article_tags(
        tag:tags(*)
      )
    `
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw new Error(`Failed to fetch all articles: ${error.message}`);
  }

  return {
    articles: data || [],
    totalCount: count || 0,
    totalPages: Math.ceil((count || 0) / limit),
    currentPage: page,
  };
}

// 为文章添加标签
export async function addTagsToArticle(articleId: string, tagIds: string[]) {
  const insertData = tagIds.map((tagId) => ({
    article_id: articleId,
    tag_id: tagId,
  }));

  const { error } = await supabaseAdmin.from("article_tags").insert(insertData);

  if (error) {
    throw new Error(`Failed to add tags to article: ${error.message}`);
  }
}

// 移除文章的标签
export async function removeTagsFromArticle(
  articleId: string,
  tagIds?: string[]
) {
  let query = supabaseAdmin
    .from("article_tags")
    .delete()
    .eq("article_id", articleId);

  if (tagIds && tagIds.length > 0) {
    query = query.in("tag_id", tagIds);
  }

  const { error } = await query;

  if (error) {
    throw new Error(`Failed to remove tags from article: ${error.message}`);
  }
}
