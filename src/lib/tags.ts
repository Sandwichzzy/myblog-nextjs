import { supabase, supabaseAdmin } from "./supabase";
import { Tag, TagInsert, TagUpdate } from "@/types/database";

// 获取所有标签
export async function getAllTags(): Promise<Tag[]> {
  const { data, error } = await supabase.from("tags").select("*").order("name");

  if (error) {
    throw new Error(`Failed to fetch tags: ${error.message}`);
  }

  return data || [];
}

// 获取热门标签（基于文章数量）
export async function getPopularTags(
  limit: number = 10
): Promise<(Tag & { article_count: number })[]> {
  const { data, error } = await supabase
    .from("tags")
    .select(
      `
      *,
      article_tags(count)
    `
    )
    .order("article_tags(count)", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to fetch popular tags: ${error.message}`);
  }

  return (data || []).map((tag) => ({
    ...tag,
    article_count: tag.article_tags?.[0]?.count || 0,
  }));
}

// 通过名称获取标签
export async function getTagByName(name: string): Promise<Tag | null> {
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .eq("name", name)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // 标签不存在
    }
    throw new Error(`Failed to fetch tag: ${error.message}`);
  }

  return data;
}

// 创建标签（管理员功能）
export async function createTag(tagData: TagInsert): Promise<Tag> {
  const { data, error } = await supabaseAdmin
    .from("tags")
    .insert(tagData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create tag: ${error.message}`);
  }

  return data;
}

// 更新标签（管理员功能）
export async function updateTag(id: string, updates: TagUpdate): Promise<Tag> {
  const { data, error } = await supabaseAdmin
    .from("tags")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update tag: ${error.message}`);
  }

  return data;
}

// 删除标签（管理员功能）
export async function deleteTag(id: string): Promise<void> {
  const { error } = await supabaseAdmin.from("tags").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete tag: ${error.message}`);
  }
}

// 搜索标签
export async function searchTags(query: string): Promise<Tag[]> {
  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .ilike("name", `%${query}%`)
    .order("name")
    .limit(20);

  if (error) {
    throw new Error(`Failed to search tags: ${error.message}`);
  }

  return data || [];
}

// 获取文章的标签
export async function getArticleTags(articleId: string): Promise<Tag[]> {
  const { data, error } = await supabase
    .from("article_tags")
    .select(
      `
      tag:tags(*)
    `
    )
    .eq("article_id", articleId);

  if (error) {
    throw new Error(`Failed to fetch article tags: ${error.message}`);
  }

  return (data || [])
    .map((item: any) => item.tag)
    .filter((tag: any): tag is Tag => tag !== null && tag !== undefined);
}

// 批量创建标签（如果不存在）
export async function createTagsIfNotExist(tagNames: string[]): Promise<Tag[]> {
  const results: Tag[] = [];

  for (const name of tagNames) {
    // 检查标签是否已存在
    let tag = await getTagByName(name);

    if (!tag) {
      // 创建新标签
      tag = await createTag({
        name,
        color: getRandomTagColor(),
      });
    }

    results.push(tag);
  }

  return results;
}

// 生成随机标签颜色
function getRandomTagColor(): string {
  const colors = [
    "#3B82F6", // blue
    "#10B981", // green
    "#F59E0B", // yellow
    "#EF4444", // red
    "#8B5CF6", // purple
    "#F97316", // orange
    "#06B6D4", // cyan
    "#84CC16", // lime
    "#EC4899", // pink
    "#6B7280", // gray
  ];

  return colors[Math.floor(Math.random() * colors.length)];
}
