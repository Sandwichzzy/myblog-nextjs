1. articles 文章列表页无法点击搜索文章，并且标签搜索点击后相应非常慢，我认为文章列表页可以不使用 ISR 配置 (1 小时重新验证)。// 缓存标签
   // ISR 缓存控制
   export const ISR_CONFIG = {
   // 首页缓存时间（10 分钟）
   HOME_REVALIDATE: 600,
   // 文章详情页缓存时间（1 小时）
   ARTICLE_REVALIDATE: 3600,
   // 文章列表页缓存时间（30 分钟）
   ARTICLES_LIST_REVALIDATE: 1800,
   // 标签页缓存时间（20 分钟）
   TAG_PAGE_REVALIDATE: 1200,
   } as const; 打包时这里会报错 不能使用这里的对象 应该直接使用具体值
