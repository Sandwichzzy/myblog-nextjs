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
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("articles")
    .select(
      `
      *,
      tags:article_tags(
        tag:tags(*)
      )
    `,
      { count: "exact" }
    )
    .eq("published", true)
    .order("created_at", { ascending: false });

  // 如果有标签筛选，需要先获取有该标签的文章ID
  if (tagFilter) {
    // 先查找标签ID
    const { data: tagData, error: tagError } = await supabase
      .from("tags")
      .select("id")
      .eq("name", tagFilter)
      .single();

    if (tagError || !tagData) {
      // 如果标签不存在，返回空结果
      return {
        articles: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: page,
      };
    }

    // 然后查找有该标签的文章ID
    const { data: taggedArticles, error: articleTagError } = await supabase
      .from("article_tags")
      .select("article_id")
      .eq("tag_id", tagData.id);

    if (articleTagError) {
      throw new Error(`Failed to filter by tag: ${articleTagError.message}`);
    }

    if (taggedArticles && taggedArticles.length > 0) {
      const articleIds = taggedArticles.map((item) => item.article_id);
      query = query.in("id", articleIds);
    } else {
      // 如果没有找到该标签的文章，返回空结果
      return {
        articles: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: page,
      };
    }
  }

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
  console.log(`[incrementViewCount] 开始处理文章 ${articleId} 的浏览量增加`);

  // 先获取当前浏览量
  const { data: currentArticle, error: fetchError } = await supabase
    .from("articles")
    .select("view_count")
    .eq("id", articleId)
    .single();

  if (fetchError) {
    console.error("[incrementViewCount] 获取当前浏览量失败:", fetchError);
    return;
  }

  const currentViewCount = currentArticle.view_count || 0;
  const newViewCount = currentViewCount + 1;

  console.log(
    `[incrementViewCount] 文章 ${articleId} 当前浏览量: ${currentViewCount}, 将更新为: ${newViewCount}`
  );

  // 增加浏览量
  const { error } = await supabase
    .from("articles")
    .update({
      view_count: newViewCount,
    })
    .eq("id", articleId);

  if (error) {
    console.error("[incrementViewCount] 更新浏览量失败:", error);
  } else {
    console.log(
      `[incrementViewCount] 成功更新文章 ${articleId} 浏览量: ${currentViewCount} -> ${newViewCount}`
    );
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
  limit: number = 10,
  tagFilter?: string
) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let supabaseQuery = supabase
    .from("articles")
    .select(
      `
      *,
      tags:article_tags(
        tag:tags(*)
      )
    `,
      { count: "exact" }
    )
    .eq("published", true)
    .or(
      `title.ilike.%${query}%,content.ilike.%${query}%,excerpt.ilike.%${query}%`
    )
    .order("created_at", { ascending: false });

  // 如果有标签筛选，需要先获取有该标签的文章ID
  if (tagFilter) {
    // 先查找标签ID
    const { data: tagData, error: tagError } = await supabase
      .from("tags")
      .select("id")
      .eq("name", tagFilter)
      .single();

    if (tagError || !tagData) {
      // 如果标签不存在，返回空结果
      return {
        articles: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: page,
      };
    }

    // 然后查找有该标签的文章ID
    const { data: taggedArticles, error: articleTagError } = await supabase
      .from("article_tags")
      .select("article_id")
      .eq("tag_id", tagData.id);

    if (articleTagError) {
      throw new Error(`Failed to filter by tag: ${articleTagError.message}`);
    }

    if (taggedArticles && taggedArticles.length > 0) {
      const articleIds = taggedArticles.map((item) => item.article_id);
      supabaseQuery = supabaseQuery.in("id", articleIds);
    } else {
      // 如果没有找到该标签的文章，返回空结果
      return {
        articles: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: page,
      };
    }
  }

  const { data, error, count } = await supabaseQuery.range(from, to);

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
    `,
      { count: "exact" }
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
