import { getAllTags } from "@/lib/tags";
import TagManagement from "@/components/TagManagement";

export default async function TagsManagePage() {
  // 获取所有标签
  const tags = await getAllTags();

  return <TagManagement initialTags={tags} />;
}

export const metadata = {
  title: "标签管理 - 我的博客管理后台",
  description: "管理博客标签",
};
