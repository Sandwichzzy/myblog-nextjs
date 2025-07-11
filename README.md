# 我的个人博客系统

基于 Next.js 15、TypeScript、Supabase 和 Tailwind CSS 构建的现代化个人博客系统。

## 🚀 项目特性

- **现代化技术栈**：Next.js 15 + TypeScript + Supabase + Tailwind CSS
- **服务端渲染**：优化 SEO 和首屏加载速度
- **增量静态再生**：ISR 策略提升性能
- **实时评论**：基于 Supabase 的评论系统
- **标签分类**：文章标签管理和筛选
- **管理后台**：文章和评论的后台管理
- **响应式设计**：完美适配各种设备

## 📋 开发进度

### ✅ 第一阶段：项目初始化

- [x] Next.js 项目创建
- [x] 基础配置完成

### ✅ 第二阶段：数据库设计与集成

- [x] Supabase 客户端配置
- [x] TypeScript 类型定义
- [x] 数据库表结构设计
- [x] 数据访问层实现
  - [x] 文章 CRUD 操作
  - [x] 标签管理功能
  - [x] 评论系统功能
- [x] 行级安全策略(RLS)配置

### ✅ 第三阶段：API 层实现

- [x] API 路由设计
  - [x] 文章 API (`/api/articles`, `/api/articles/[slug]`)
  - [x] 标签 API (`/api/tags`)
  - [x] 评论 API (`/api/comments`)
- [x] 数据验证和错误处理
  - [x] Zod 验证规则
  - [x] 统一错误处理机制
  - [x] API 响应格式标准化
- [x] 缓存策略实现
  - [x] 响应缓存配置
  - [x] 限流机制
  - [x] 安全防护

### ✅ 第四阶段：页面开发

- [x] 基础布局组件
  - [x] 响应式导航栏 (Navigation)
  - [x] 页脚组件 (Footer)
  - [x] 主布局容器 (MainLayout)
- [x] 文章列表页
  - [x] 文章卡片组件 (ArticleCard)
  - [x] 搜索和筛选组件 (SearchAndFilter)
  - [x] 分页组件 (Pagination)
  - [x] 文章列表页面 (/articles)
- [x] 文章详情页
  - [x] 动态路由页面 (/articles/[slug])
  - [x] 文章详情展示组件
  - [x] 面包屑导航
  - [x] 文章元信息展示
  - [x] 标签展示和链接
  - [x] Markdown 内容渲染
  - [x] 骨架屏加载状态
  - [x] 错误处理和 404 页面
- [x] 文章创建/编辑页
  - [x] 文章创建页面 (/admin/articles/new)
  - [x] 文章编辑页面 (/admin/articles/[slug]/edit)
  - [x] ArticleForm 组件实现
  - [x] Markdown 编辑器和实时预览
  - [x] 标签选择功能
  - [x] 表单验证和错误处理
- [x] 管理后台页面
  - [x] 管理后台首页 (/admin)
  - [x] 文章管理页面 (/admin/articles)
  - [x] 标签管理页面 (/admin/tags)
  - [x] 统计信息展示
  - [x] 快速操作面板

### ⏳ 第五阶段：状态管理与数据获取

- [ ] SWR 集成和配置
- [ ] 数据获取 hooks
- [ ] 错误处理和加载状态

### ⏳ 第六阶段：性能优化

- [ ] SEO 优化
- [ ] ISR 增量静态再生
- [ ] 图片优化
- [ ] 代码分割

## 🗄️ 数据库结构

### 主要表结构

```sql
-- 文章表
articles (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  slug VARCHAR(255) UNIQUE,
  content TEXT,
  excerpt TEXT,
  author_id UUID,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  published BOOLEAN,
  view_count INTEGER
)

-- 标签表
tags (
  id UUID PRIMARY KEY,
  name VARCHAR(100) UNIQUE,
  color VARCHAR(7),
  created_at TIMESTAMP
)

-- 文章标签关联表
article_tags (
  article_id UUID REFERENCES articles(id),
  tag_id UUID REFERENCES tags(id),
  created_at TIMESTAMP
)

-- 评论表
comments (
  id UUID PRIMARY KEY,
  article_id UUID REFERENCES articles(id),
  author_name VARCHAR(100),
  author_email VARCHAR(255),
  content TEXT,
  created_at TIMESTAMP,
  published BOOLEAN
)
```

## 🛠️ 已实现功能

### API 层架构

- **统一响应格式**：标准化的 JSON API 响应结构
- **数据验证**：基于 Zod 的严格输入验证
- **错误处理**：全面的错误捕获和格式化
- **缓存策略**：智能缓存配置优化性能
- **安全防护**：限流、内容清理、XSS 防护
- **类型安全**：完整的 TypeScript 类型支持

### API 端点

#### 文章 API

- `GET /api/articles` - 获取文章列表（支持分页、搜索、标签筛选）
- `POST /api/articles` - 创建新文章（管理员）
- `GET /api/articles/[slug]` - 获取文章详情
- `PUT /api/articles/[slug]` - 更新文章（管理员）
- `DELETE /api/articles/[slug]` - 删除文章（管理员）

#### 标签 API

- `GET /api/tags` - 获取标签列表（支持搜索、热门标签）
- `POST /api/tags` - 创建新标签（管理员）

#### 评论 API

- `GET /api/comments` - 获取评论列表（支持按文章筛选、审核状态）
- `POST /api/comments` - 创建新评论（公开）

### 数据访问层

- **文章管理**

  - 获取已发布文章列表（支持分页和标签筛选）
  - 通过 slug 获取文章详情
  - 文章搜索功能
  - 文章 CRUD 操作（管理员）
  - 浏览量统计

- **标签系统**

  - 标签 CRUD 操作
  - 热门标签获取
  - 标签搜索
  - 文章标签关联管理

- **评论功能**
  - 评论创建和展示
  - 评论审核系统
  - 评论统计和管理

### 用户界面组件

- **布局组件**

  - 响应式导航栏（支持移动端菜单）
  - 页脚组件（包含链接和版权信息）
  - 主布局容器（统一页面结构）

- **文章展示组件**

  - 文章卡片组件（展示文章信息和标签）
  - 搜索和筛选组件（支持关键词搜索和标签筛选）
  - 分页组件（智能分页导航）

- **页面组件**

  - 首页（Hero 区块和最新文章展示）
  - 文章列表页（完整的文章浏览体验）
  - 文章详情页（完整的文章阅读体验）
  - 空状态处理（无数据时的友好提示）

- **管理后台页面**

  - 管理后台首页（统计信息和快速操作）
  - 文章管理页面（文章列表、编辑、删除）
  - 文章创建页面（Markdown 编辑器和实时预览）
  - 文章编辑页面（支持更新现有文章）
  - 标签管理页面（标签创建和管理）

- **文章详情页功能**

  - 动态路由支持（基于文章 slug）
  - 完整的文章内容展示
  - 面包屑导航（便于用户导航）
  - 文章元信息（发布时间、浏览量、阅读时长）
  - 标签展示和跳转（可点击跳转到筛选页）
  - Markdown 内容渲染（支持基本格式化）
  - 自动浏览量统计（防刷机制）
  - 骨架屏加载状态（优化加载体验）
  - 错误处理和 404 页面（用户友好的错误提示）

- **交互功能**

  - 防抖搜索（优化搜索体验）
  - 筛选状态管理（实时筛选反馈）
  - 加载状态指示器（骨架屏加载效果）
  - 响应式设计（适配各种设备）
  - 平滑滚动动画（提升用户体验）

- **管理后台功能**
  - 文章 CRUD 操作（创建、编辑、删除）
  - Markdown 编辑器（支持实时预览）
  - 标签管理（创建、编辑、删除标签）
  - 统计信息展示（文章数量、发布状态）
  - 批量操作（支持批量管理文章）
  - 表单验证（完整的客户端验证）
  - 错误处理（友好的错误提示）

## 🔧 环境配置

1. **环境变量设置**
   创建 `.env.local` 文件并配置以下变量：

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   DATABASE_URL=your-database-url
   ```

2. **数据库初始化**
   在 Supabase 中运行 `database/schema.sql` 脚本来创建表结构

3. **启动开发服务器**
   ```bash
   npm run dev
   ```

## 📁 项目结构

```
my-blog/
├── src/
│   ├── app/          # Next.js App Router 页面和API
│   │   ├── api/      # API 路由
│   │   │   ├── articles/
│   │   │   │   ├── route.ts      # 文章列表API
│   │   │   │   └── [slug]/
│   │   │   │       └── route.ts  # 文章详情API
│   │   │   ├── tags/
│   │   │   │   └── route.ts      # 标签API
│   │   │   └── comments/
│   │   │       └── route.ts      # 评论API
│   │   ├── admin/               # 管理后台
│   │   │   ├── articles/
│   │   │   │   ├── new/
│   │   │   │   │   └── page.tsx  # 文章创建页
│   │   │   │   ├── [slug]/
│   │   │   │   │   └── edit/
│   │   │   │   │       └── page.tsx  # 文章编辑页
│   │   │   │   └── page.tsx      # 文章管理页
│   │   │   ├── tags/
│   │   │   │   └── page.tsx      # 标签管理页
│   │   │   └── page.tsx          # 管理后台首页
│   │   ├── articles/
│   │   │   └── page.tsx          # 文章列表页
│   │   ├── layout.tsx            # 根布局
│   │   ├── page.tsx              # 首页
│   │   └── globals.css           # 全局样式
│   ├── components/   # React 组件
│   │   ├── Navigation.tsx        # 导航栏组件
│   │   ├── Footer.tsx            # 页脚组件
│   │   ├── MainLayout.tsx        # 主布局容器
│   │   ├── ArticleCard.tsx       # 文章卡片组件
│   │   ├── ArticleForm.tsx       # 文章表单组件
│   │   ├── SearchAndFilter.tsx   # 搜索筛选组件
│   │   ├── Pagination.tsx        # 分页组件
│   │   └── index.ts              # 组件导出
│   ├── lib/          # 工具函数和数据访问层
│   │   ├── supabase.ts      # Supabase 客户端配置
│   │   ├── articles.ts      # 文章数据访问
│   │   ├── tags.ts          # 标签数据访问
│   │   ├── comments.ts      # 评论数据访问
│   │   ├── validations.ts   # API 数据验证规则
│   │   ├── api-utils.ts     # API 工具函数
│   │   └── utils.ts         # 通用工具函数
│   └── types/        # TypeScript 类型定义
│       └── database.ts      # 数据库类型
├── database/         # 数据库脚本
│   └── schema.sql    # 数据库表结构
├── docs/            # 项目文档
│   └── supabase-setup-guide.md
└── public/          # 静态资源
```

## 🎯 下一步计划

第四阶段的页面开发已基本完成，下一步计划包括：

1. **评论系统界面**

   - 评论列表组件
   - 评论表单组件
   - 评论回复功能
   - 评论管理界面

2. **功能完善**

   - 登陆和 Auth 权限访问控制(使用 supabase)，管理员（可以在 navigation 组件跳转到/admin）普通读者无权访问该路径
   - 文章删除功能实现
   - 标签编辑/删除功能
   - 批量操作功能
   - 图片上传功能

3. **内容优化**

   - 图片懒加载优化
   - 目录导航（TOC）
   - 阅读进度指示器
   - 相关文章推荐

4. **SEO 优化**

   - 动态页面标题和元数据
   - 结构化数据（JSON-LD）
   - Open Graph 支持
   - 站点地图生成

5. **用户体验提升**
   - 深色模式支持
   - 字体大小调节
   - 全文搜索优化
   - 移动端手势支持

## 📝 管理后台详细功能

### 已完成的管理后台页面

1. **管理后台首页** (`/admin`)

   - 统计信息仪表板（文章总数、已发布、草稿、标签数量）
   - 快速操作面板（创建文章、管理文章、管理标签）
   - 最新文章列表展示
   - 直观的数据可视化

2. **文章管理页面** (`/admin/articles`)

   - 文章列表展示（包括草稿和已发布）
   - 文章状态标识（已发布/草稿）
   - 浏览量统计显示
   - 快速操作按钮（查看、编辑、删除）
   - 分页功能支持

3. **文章创建页面** (`/admin/articles/new`)

   - 完整的文章表单（标题、Slug、摘要、内容）
   - Markdown 编辑器和实时预览切换
   - 标签选择功能（支持多选）
   - 发布状态控制
   - 表单验证和错误处理

4. **文章编辑页面** (`/admin/articles/[slug]/edit`)

   - 加载现有文章数据进行编辑
   - 支持所有创建页面的功能
   - 保留原有标签关联
   - 更新成功后跳转

5. **标签管理页面** (`/admin/tags`)
   - 标签列表展示
   - 创建新标签表单
   - 标签颜色选择器
   - 标签统计信息

### 核心组件

- **ArticleForm 组件**：统一的文章创建/编辑表单
  - 自动生成 URL Slug
  - Markdown 编辑器集成
  - 实时预览功能
  - 标签选择界面
  - 完整的表单验证

## 🚀 部署

项目最终将部署到 Vercel 平台，利用其无服务器函数和全球 CDN 优化性能。
