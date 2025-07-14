import { ArticleFormSkeleton, PageLoadingIndicator } from "@/components";

export default function NewArticleLoading() {
  return (
    <>
      <ArticleFormSkeleton />
      <PageLoadingIndicator message="正在加载文章创建器..." color="blue" />
    </>
  );
}
