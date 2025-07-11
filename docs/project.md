实现个人博客系统开发

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
- [ ]

#核心实现要点 1.数据层集成 (15 分)
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

#开发路线图
graph TD
A[项目初始化] --> B[数据库设计]
B --> C[API 实现]
C --> D[页面开发]
D --> E[状态管理]
E --> F[性能优化]
F --> G[部署发布]

第一阶段：项目初始化与依赖配置（已完成 ✅）
Next.js 项目已创建
基础配置文件已就绪
第二阶段：数据库设计与集成
2.1 数据库选择与配置
集成 Supabase 作为后端数据库
配置环境变量 (.env.local)
安装相关依赖包
2.2 数据库表结构设计
Apply to articles.ts
第三阶段：API 层实现
3.1 数据访问层
创建 Supabase 客户端配置
实现文章 CRUD 操作函数
实现标签管理函数
实现评论功能函数
3.2 API 路由设计
/api/articles - GET（列表）, POST（创建）
/api/articles/[slug] - GET（详情）, PUT（更新）, DELETE（删除）
/api/tags - GET（标签列表）
/api/comments - GET, POST（评论功能）

第四阶段：页面开发
4.1 基础布局组件
Header 导航组件
Footer 组件
侧边栏组件（可选）
Loading 骨架屏组件
Error 错误处理组件
4.2 核心页面开发
首页/文章列表页 (/)
文章卡片组件
分页组件
搜索功能
标签筛选
文章详情页 (/posts/[slug])
Markdown 渲染
代码高亮
目录导航
评论区域
文章创建页 (/admin/create)
Markdown 编辑器
实时预览
标签选择
发布状态控制
文章编辑页 (/admin/edit/[slug])
加载现有文章数据
编辑功能
删除确认
4.3 管理后台页面
文章管理列表
标签管理
评论管理
第五阶段：状态管理与数据获取
5.1 SWR 集成
配置 SWR Provider
实现数据获取 hooks
缓存策略配置
错误处理和重试机制
5.2 状态管理
用户认证状态
主题切换状态
搜索状态管理
第六阶段：性能优化
6.1 SEO 优化
动态 Meta 标签
结构化数据 (JSON-LD)
sitemap.xml 生成
robots.txt 配置
6.2 ISR 增量静态再生
文章详情页 ISR 配置
列表页静态生成
按需重新验证
6.3 性能优化
图片优化 (next/image)
代码分割
预加载关键资源
懒加载组件
第七阶段：样式与交互
7.1 UI 库选择与配置
Tailwind CSS 深度定制
或集成 shadcn/ui 组件库
响应式设计
深色模式支持
7.2 交互功能
平滑滚动
动画效果
搜索联想
无限滚动（可选）
第八阶段：测试与部署
8.1 测试
单元测试关键组件
API 接口测试
E2E 测试核心流程
8.2 部署到 Vercel
环境变量配置
域名绑定
性能监控配置

#使用 SWR 数据请求策略
