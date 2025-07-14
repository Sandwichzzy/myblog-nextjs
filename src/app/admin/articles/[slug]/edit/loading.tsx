import { ArticleFormSkeleton, PageLoadingIndicator } from "@/components";

export default function EditArticleLoading() {
  return (
    <>
      <ArticleFormSkeleton />
      <PageLoadingIndicator message="正在加载文章编辑器..." color="blue" />
    </>
  );
}
