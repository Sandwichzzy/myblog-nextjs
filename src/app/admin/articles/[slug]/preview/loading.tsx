import { ArticlePreviewSkeleton, PageLoadingIndicator } from "@/components";

export default function ArticlePreviewLoading() {
  return (
    <>
      <ArticlePreviewSkeleton />
      <PageLoadingIndicator message="正在加载文章预览..." color="green" />
    </>
  );
}
