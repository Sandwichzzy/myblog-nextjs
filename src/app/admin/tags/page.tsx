import { getAllTags } from "@/lib/tags";
import { TagForm, TagActions } from "@/components";

export default async function TagsManagePage() {
  // 获取所有标签
  const tags = await getAllTags();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">标签管理</h1>
          <p className="mt-2 text-gray-600">管理博客标签，用于分类和组织文章</p>
        </div>

        {/* 创建新标签表单 */}
        <TagForm />

        {/* 标签统计 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{tags.length}</p>
            <p className="text-sm text-gray-600">总标签数</p>
          </div>
        </div>

        {/* 标签列表 */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">所有标签</h2>
          </div>

          {tags.length > 0 ? (
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="font-medium text-gray-900">
                        {tag.name}
                      </span>
                    </div>

                    <TagActions tagId={tag.id} tagName={tag.name} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                还没有标签
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                创建您的第一个标签来组织文章。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "标签管理 - 我的博客管理后台",
  description: "管理博客标签",
};
