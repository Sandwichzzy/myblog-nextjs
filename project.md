# 基础功能（60 分）

- [ ] 文章列表页（含分页）
- [ ] 文章详情页
- [ ] 文章创建页面
- [ ] 基础 SEO 优化
- [ ] 实现 ISR 增量静态再生

# 进阶功能（40 分）

- [ ] 文章编辑/删除功能
- [ ] Markdown 内容渲染
- [ ] 标签分类系统
- [ ] 评论功能集成
- [ ] 部署到 Vercel

核心实现要点 1.数据层集成 (15 分)
// 补充 Supabase 查询示例
export async function getArticles() {
const { data, error } = await supabase
.from('articles')
.select('id, title, slug, created_at')
.order('created_at', { ascending: false })

if (error) throw new Error('Failed to fetch articles')
return data
}

// 创建文章示例
export async function createArticle(articleData) {
const { data, error } = await supabase
.from('articles')
.insert([{
...articleData,
author_id: supabase.auth.user()?.id
}])

if (error) throw new Error('Failed to create article')
return data
}

2.列表页优化 (10 分)
// 添加加载状态和错误处理 (考虑是否使用 app route 下 loading 和 error 而不新建 component)
function ArticleList() {
const { data: articles, error } = useSWR('/api/articles', fetcher, {
refreshInterval: 30000 // 30 秒刷新
})

if (error) return <ErrorComponent />
if (!articles) return <LoadingSkeleton />

return (
<div className="grid gap-6">
{articles.map(article => (
<ArticlePreview key={article.id} article={article} />
))}
</div>
)
}
