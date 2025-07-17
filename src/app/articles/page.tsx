import { Suspense } from "react";
import { ArticlesPageClient } from "./ArticlesPageClient";
import { ArticlesPageSkeleton } from "@/components/skeletons";

export const dynamic = "force-dynamic";

export default function ArticlesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<ArticlesPageSkeleton />}>
        <ArticlesPageClient />
      </Suspense>
    </div>
  );
}
