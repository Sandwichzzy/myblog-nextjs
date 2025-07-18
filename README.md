# 我的个人博客系统

基于 Next.js 15、TypeScript、Supabase 和 Tailwind CSS 构建的现代化个人博客系统。

## 🚀 项目特性

- **现代化技术栈**：Next.js 15 + TypeScript + Supabase + Tailwind CSS
- **服务端渲染**：优化 SEO 和首屏加载速度
- **增量静态再生**：ISR 策略提升性能
- **智能认证系统**：使用 `headers().get('origin')` 自动适配多环境
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
  - [x] 响应式导航栏 (Navigation) - 已集成登录状态
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

### ✅ 第五阶段：用户认证系统

- [x] **数据库扩展**

  - [x] 用户配置表 (user_profiles)
  - [x] 用户角色管理 (admin/user)
  - [x] 行级安全策略 (RLS) 更新
  - [x] 自动触发器 (用户注册后创建配置)

- [x] **认证基础设施**

  - [x] Supabase Auth 集成配置
  - [x] OAuth 提供商配置 (GitHub, Google)
  - [x] 认证工具函数库 (`src/lib/auth.ts`)
  - [x] TypeScript 类型定义扩展
  - [x] 服务端 OAuth API (`/api/auth/signin`) - 使用 `headers().get('origin')` 自动获取域名

- [x] **状态管理**

  - [x] React Context 认证提供者 (`AuthProvider`)
  - [x] 自定义 Hooks (`useAuth`, `useUser`, `useAdmin`)
  - [x] 认证状态持久化和监听
  - [x] 权限检查和角色管理

- [x] **用户界面**

  - [x] 登录页面 (`/auth/login`) - GitHub & Google OAuth
  - [x] OAuth 回调处理 (`/auth/callback`)
  - [x] 导航栏登录状态集成
  - [x] 用户下拉菜单 (桌面端和移动端)
  - [x] 管理员标识和快速入口

- [x] **路由保护**

  - [x] AuthGuard 组件 (客户端路由保护)
  - [x] 管理后台布局保护 (`/admin/*`)
  - [x] 权限不足和未登录提示页面
  - [x] 自动重定向逻辑

- [x] **权限管理**
  - [x] 第一个注册用户自动成为管理员
  - [x] 管理员权限检查函数
  - [x] 数据库级权限控制 (RLS 策略)
  - [x] API 路由权限验证准备

### ✅ 第六阶段：评论系统界面

- [x] **评论显示功能**

  - [x] 评论列表组件 (CommentList)
  - [x] 分页加载和无限滚动
  - [x] 评论状态管理和实时更新
  - [x] 用户友好的空状态处理

- [x] **评论提交功能**

  - [x] 评论表单组件 (CommentForm)
  - [x] 表单验证和错误处理（使用统一的 validations.ts 规则）
  - [x] 支持已登录用户信息自动填入
  - [x] 防垃圾评论机制
  - [x] 用户身份验证和权限控制
  - [x] 只允许登录用户发表评论

- [x] **文章评论集成**

  - [x] 文章详情页评论区域 (ArticleComments)
  - [x] 服务端渲染初始评论数据
  - [x] 评论提交后自动刷新列表

- [x] **管理员评论管理**

  - [x] 评论管理界面 (CommentManagement) - API Routes 版本
  - [x] 评论管理界面 (CommentManagementServer) - Server Actions 版本
  - [x] 待审核评论筛选和展示
  - [x] 单个评论审核(通过/拒绝)
  - [x] 批量评论操作
  - [x] 评论统计信息展示
  - [x] 管理后台导航集成
  - [x] 混合架构实现（双版本对比）

- [x] **权限管理**

  - [x] 管理员权限验证中间件
  - [x] API 路由权限保护
  - [x] Server Actions 权限保护
  - [x] 用户身份识别和角色检查
  - [x] 未登录用户友好提示
  - [x] 数据库 RLS 策略修复（只允许登录用户评论）
  - [x] 评论用户身份关联和验证

- [x] **API 端点扩展**
  - [x] 管理员评论操作 API (`/api/admin/comments/[id]`)
  - [x] 批量评论操作 API (`/api/admin/comments/bulk`)
  - [x] Server Actions 实现 (`src/lib/actions/comment-actions.ts`)
  - [x] 完善的错误处理和响应格式

### ✅ 第七阶段：架构优化 - 混合模式

- [x] **架构模式设计**

  - [x] Server Actions vs API Routes 对比分析
  - [x] 混合架构实现策略
  - [x] 性能优化方案选择
  - [x] 开发体验提升

- [x] **Server Actions 实现**

  - [x] 评论管理 Server Actions (`src/lib/actions/comment-actions.ts`)
  - [x] 服务器端权限验证优化
  - [x] 自动缓存重新验证
  - [x] 表单处理优化

- [x] **双版本对比系统**

  - [x] API Routes 版本 (`/admin/comments`)
  - [x] Server Actions 版本 (`/admin/comments-server`)
  - [x] 性能对比界面
  - [x] 版本切换功能

- [x] **开发规范统一**

  - [x] 表单验证规则集中化 (validations.ts)
  - [x] 所有表单组件统一使用 Zod 验证
  - [x] 错误处理标准化
  - [x] 类型安全保障

- [x] **文档和指南**
  - [x] 架构对比文档 (`docs/server-actions-vs-api-routes.md`)
  - [x] 最佳实践建议
  - [x] 选择指南和使用场景
  - [x] 性能测试结果

### ✅ 第八阶段：性能优化

- [x] **ISR 增量静态再生**

  - [x] 首页 ISR 配置 (10 分钟重新验证)
  - [x] 文章详情页 ISR 配置 (1 小时重新验证)
  - [x] 文章列表页混合架构 (30 分钟重新验证)
  - [x] 静态参数生成 (预生成最新 20 篇文章)
  - [x] 动态 metadata 生成 (SEO 优化)
  - [x] ISR 工具函数库 (`src/lib/isr-utils.ts`)
  - [x] 缓存策略配置和优化
  - [x] Next.js 配置优化 (PPR, 压缩等)

- [x] **SEO 优化**

  - [x] 动态 metadata 生成（页面标题、描述）
  - [x] Open Graph 支持（社交分享卡片）
  - [x] Twitter Card 支持
  - [x] 结构化数据 (JSON-LD)
  - [x] 站点地图生成（sitemap.xml）
  - [x] robots.txt 优化
  - [x] 404/错误页 SEO 友好处理

### 说明

- 首页、文章详情页、标签页均已支持动态 SEO 元数据。
- Open Graph 与 Twitter Card 自动生成，提升社交平台分享效果。
- 后续将补充 JSON-LD 结构化数据，提升搜索引擎可见性。
- 站点地图和 robots.txt 计划自动生成，便于搜索引擎抓取。

---

## 🖼️ 图片优化

### 已完成

- [x] 图片组件统一使用 Next.js <Image />，自动优化加载
- [x] 静态资源图片（如 logo、icon）已压缩

## 🗄️ 数据库结构

### 完整表结构

```sql
-- ============================================================================
-- 核心数据表设计
-- ============================================================================

-- 文章表 (articles)
CREATE TABLE articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,                    -- 文章标题
  slug VARCHAR(255) UNIQUE NOT NULL,              -- URL友好标识符
  content TEXT NOT NULL,                          -- 文章正文（Markdown）
  excerpt TEXT,                                   -- 文章摘要
  author_id UUID,                                 -- 作者ID（预留）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published BOOLEAN DEFAULT false,                -- 发布状态
  view_count INTEGER DEFAULT 0                    -- 浏览量
);

-- 标签表 (tags)
CREATE TABLE tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,              -- 标签名称
  color VARCHAR(7) DEFAULT '#3B82F6',             -- 标签颜色（十六进制）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 文章标签关联表 (article_tags)
CREATE TABLE article_tags (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (article_id, tag_id)               -- 复合主键防重复
);

-- 评论表 (comments)
CREATE TABLE comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  author_name VARCHAR(100) NOT NULL,              -- 评论者姓名
  author_email VARCHAR(255),                      -- 评论者邮箱
  content TEXT NOT NULL,                          -- 评论内容
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published BOOLEAN DEFAULT false,                -- 审核状态
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL -- 关联用户ID
);

-- 用户配置表 (user_profiles) - 扩展Supabase Auth
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name VARCHAR(255),                      -- 显示名称
  avatar_url TEXT,                               -- 头像URL
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')), -- 用户角色
  is_active BOOLEAN DEFAULT true,                -- 账户状态
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 索引优化

```sql
-- 性能优化索引
CREATE INDEX idx_articles_published ON articles(published);
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_comments_article_id ON comments(article_id);
CREATE INDEX idx_comments_published ON comments(published);
CREATE INDEX idx_comments_user_id ON comments(user_id);

-- 全文搜索索引
CREATE INDEX articles_search_idx ON articles
USING gin(to_tsvector('english', title || ' ' || content));
```

### 行级安全策略 (RLS)

```sql
-- 启用所有表的行级安全
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 文章访问策略
CREATE POLICY "Everyone can read published articles" ON articles
  FOR SELECT USING (published = true);

-- 标签访问策略
CREATE POLICY "Everyone can read tags" ON tags
  FOR SELECT USING (true);

-- 评论访问策略
CREATE POLICY "Everyone can read published comments" ON comments
  FOR SELECT USING (published = true);

-- 只允许登录用户创建评论
CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 用户配置策略
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 管理员可以查看所有配置
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 自动化触发器

```sql
-- 自动更新时间戳
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 用户注册后自动创建配置
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id, display_name, avatar_url, role, is_active, created_at, updated_at
  ) VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    'user',
    true,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();
```

### 业务逻辑函数

```sql
-- 原子性增加文章浏览量
CREATE OR REPLACE FUNCTION increment_view_count(article_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE articles
  SET view_count = view_count + 1
  WHERE id = article_id;
END;
$$ language 'plpgsql';

-- 获取标签统计
CREATE OR REPLACE FUNCTION get_tags_with_count()
RETURNS TABLE(
  id UUID,
  name VARCHAR(100),
  color VARCHAR(7),
  created_at TIMESTAMP WITH TIME ZONE,
  article_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.name, t.color, t.created_at,
         COUNT(at.article_id) as article_count
  FROM tags t
  LEFT JOIN article_tags at ON t.id = at.tag_id
  LEFT JOIN articles a ON at.article_id = a.id AND a.published = true
  GROUP BY t.id, t.name, t.color, t.created_at
  ORDER BY article_count DESC, t.name;
END;
$$ language 'plpgsql';
```

## 🛠️ 已实现功能

### 混合架构设计

本项目采用**Server Actions + API Routes 混合架构**，根据不同场景选择最优方案：

- **Server Actions**：用于简单 CRUD 操作，性能更优，自动缓存管理
- **API Routes**：用于复杂交互逻辑，支持外部客户端，RESTful 标准
- **统一验证**：所有表单使用集中化的 Zod 验证规则
- **双版本对比**：提供两种实现方式的对比界面

### API 层架构

- **统一响应格式**：标准化的 JSON API 响应结构
- **数据验证**：基于 Zod 的严格输入验证（集中化管理）
- **错误处理**：全面的错误捕获和格式化
- **缓存策略**：智能缓存配置优化性能
- **安全防护**：限流、内容清理、XSS 防护
- **类型安全**：完整的 TypeScript 类型支持

## 📡 API 接口文档

### 认证相关 API

#### POST /api/auth/signin

OAuth 登录接口

**请求体:**

```json
{
  "provider": "github" | "google"
}
```

**响应:**

```json
{
  "success": true,
  "url": "https://oauth-provider-url..."
}
```

### 文章 API

#### GET /api/articles

获取文章列表

**查询参数:**

- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 10, 最大: 100)
- `tag`: 标签筛选
- `search`: 搜索关键词
- `published`: 发布状态 (默认只返回已发布文章)

**响应:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "文章标题",
      "slug": "article-slug",
      "excerpt": "文章摘要",
      "published": true,
      "view_count": 100,
      "created_at": "2024-01-01T00:00:00Z",
      "tags": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "totalCount": 50
  }
}
```

#### POST /api/articles

创建新文章 (需要管理员权限)

**请求体:**

```json
{
  "title": "文章标题",
  "slug": "article-slug",
  "content": "文章内容（Markdown）",
  "excerpt": "文章摘要",
  "published": false,
  "tagIds": ["tag-uuid-1", "tag-uuid-2"]
}
```

#### GET /api/articles/[slug]

获取文章详情

**查询参数:**

- `increment_view`: 是否增加浏览量 (默认: true)

**响应:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "文章标题",
    "slug": "article-slug",
    "content": "完整文章内容",
    "excerpt": "文章摘要",
    "published": true,
    "view_count": 100,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "tags": [...]
  }
}
```

#### PUT /api/articles/[slug]

更新文章 (需要管理员权限)

**请求体:** (所有字段可选)

```json
{
  "title": "新标题",
  "slug": "new-slug",
  "content": "新内容",
  "excerpt": "新摘要",
  "published": true,
  "tagIds": ["tag-uuid-1"]
}
```

#### DELETE /api/articles/[slug]

删除文章 (需要管理员权限)

### 标签 API

#### GET /api/tags

获取标签列表

**查询参数:**

- `search`: 搜索关键词
- `limit`: 数量限制 (默认: 10, 最大: 50)
- `popular`: 是否只获取热门标签 (默认: false)

**响应:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "JavaScript",
      "color": "#F7DF1E",
      "created_at": "2024-01-01T00:00:00Z",
      "article_count": 5
    }
  ]
}
```

#### POST /api/tags

创建新标签 (需要管理员权限)

**请求体:**

```json
{
  "name": "标签名称",
  "color": "#3B82F6"
}
```

#### PUT /api/tags/[id]

更新标签 (需要管理员权限)

#### DELETE /api/tags/[id]

删除标签 (需要管理员权限)

### 评论 API

#### GET /api/comments

获取评论列表

**查询参数:**

- `page`: 页码 (默认: 1)
- `limit`: 每页数量 (默认: 20, 最大: 100)
- `articleId`: 文章 ID 筛选
- `published`: 发布状态筛选 (管理员功能)

**响应:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "article_id": "uuid",
      "author_name": "用户名",
      "author_email": "user@example.com",
      "content": "评论内容",
      "published": true,
      "created_at": "2024-01-01T00:00:00Z",
      "user_id": "uuid"
    }
  ],
  "pagination": {...}
}
```

#### POST /api/comments

创建新评论 (需要登录)

**请求体:**

```json
{
  "articleId": "uuid",
  "author_name": "用户名",
  "author_email": "user@example.com",
  "content": "评论内容"
}
```

### 管理员 API

#### PATCH /api/admin/comments/[id]

审核单个评论 (需要管理员权限)

**请求体:**

```json
{
  "published": true
}
```

#### DELETE /api/admin/comments/[id]

删除评论 (需要管理员权限)

#### POST /api/admin/comments/bulk

批量操作评论 (需要管理员权限)

**请求体:**

```json
{
  "action": "approve" | "reject" | "delete",
  "commentIds": ["uuid1", "uuid2"]
}
```

### API 通用特性

- **统一响应格式**: 所有 API 使用标准化的 JSON 响应格式
- **数据验证**: 使用 Zod 进行严格的输入验证
- **错误处理**: 完善的错误捕获和格式化
- **限流保护**: 防止 API 滥用的限流机制
- **缓存策略**: 智能缓存配置优化性能
- **安全防护**: XSS 防护、内容清理、权限验证
- **类型安全**: 完整的 TypeScript 类型支持

### API 端点概览

#### 文章 API

- `GET /api/articles` - 获取文章列表（支持分页、搜索、标签筛选）
- `POST /api/articles` - 创建新文章（管理员）
- `GET /api/articles/[slug]` - 获取文章详情
- `PUT /api/articles/[slug]` - 更新文章（管理员）
- `DELETE /api/articles/[slug]` - 删除文章（管理员）

#### 标签 API

- `GET /api/tags` - 获取标签列表（支持搜索、热门标签）
- `POST /api/tags` - 创建新标签（管理员）
- `PUT /api/tags/[id]` - 更新标签（管理员）
- `DELETE /api/tags/[id]` - 删除标签（管理员）

#### 评论 API

- `GET /api/comments` - 获取评论列表（支持按文章筛选、审核状态）
- `POST /api/comments` - 创建新评论（需要登录）

#### 认证 API

- `POST /api/auth/signin` - OAuth 登录（GitHub、Google）

#### 管理员 API

- `PATCH /api/admin/comments/[id]` - 审核单个评论
- `DELETE /api/admin/comments/[id]` - 删除评论
- `POST /api/admin/comments/bulk` - 批量操作评论

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
  - 加载状态优化（骨架屏和加载指示器）

## 🔧 环境配置

1. **环境变量设置**
   创建 `.env.local` 文件并配置以下变量：

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   DATABASE_URL=your-database-url
   ```

   **环境区分逻辑：**

   - **OAuth 登录**：自动使用 `headers().get('origin')` 获取当前域名
   - **SEO 元数据**：使用固定的生产环境域名
   - 无需手动配置域名，系统会自动适配开发、测试、生产环境

2. **数据库初始化**
   在 Supabase SQL 编辑器中依次运行以下脚本：

   ```sql
   -- 1. 基础表结构和索引
   \i database/schema.sql

   -- 2. 用户认证系统扩展
   \i database/auth-extension.sql

   -- 3. 修复 RLS 递归问题
   \i database/fix-rls-recursion.sql

   -- 4. 修复评论系统用户身份验证
   \i database/fix-comment-user-auth.sql

   -- 5. RPC 函数（标签计数等）
   \i database/rpc-functions.sql
   ```

   **注意事项：**

   - 确保按照顺序执行脚本
   - 每个脚本执行完成后检查是否有错误
   - 第一个注册的用户会自动成为管理员

3. **OAuth 提供商配置**
   在 Supabase Dashboard > Authentication > Providers 中配置：

   **GitHub OAuth:**

   - 在 GitHub 创建 OAuth App
   - 回调 URL: `https://your-project.supabase.co/auth/v1/callback`
   - 在 Supabase 中输入 Client ID 和 Client Secret

   **Google OAuth:**

   - 在 Google Cloud Console 创建 OAuth 2.0 客户端
   - 授权重定向 URI: `https://your-project.supabase.co/auth/v1/callback`
   - 在 Supabase 中输入 Client ID 和 Client Secret

4. **启动开发服务器**

   ```bash
   npm run dev
   ```

5. **管理员账户设置**

   - 第一个注册的用户会自动成为管理员
   - 或在数据库中手动设置：`UPDATE user_profiles SET role = 'admin' WHERE id = 'user-uuid'`

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
│   │   │   ├── comments/
│   │   │   │   └── route.ts      # 评论API
│   │   │   └── admin/            # 管理员专用API
│   │   │       └── comments/
│   │   │           ├── [id]/
│   │   │           │   └── route.ts # 单个评论操作API
│   │   │           └── bulk/
│   │   │               └── route.ts # 批量评论操作API
│   │   ├── admin/               # 管理后台
│   │   │   ├── articles/
│   │   │   │   ├── new/
│   │   │   │   │   ├── loading.tsx # 新建文章加载页
│   │   │   │   │   └── page.tsx  # 文章创建页
│   │   │   │   ├── [slug]/
│   │   │   │   │   ├── edit/
│   │   │   │   │   │   ├── loading.tsx # 编辑加载页
│   │   │   │   │   │   └── page.tsx  # 文章编辑页
│   │   │   │   │   └── preview/
│   │   │   │   │       ├── loading.tsx # 预览加载页
│   │   │   │   │       └── page.tsx  # 文章预览页
│   │   │   │   ├── loading.tsx   # 文章列表加载页
│   │   │   │   └── page.tsx      # 文章管理页
│   │   │   ├── tags/
│   │   │   │   ├── loading.tsx   # 标签管理加载页
│   │   │   │   └── page.tsx      # 标签管理页
│   │   │   ├── comments/         # 评论管理
│   │   │   │   ├── loading.tsx   # 评论管理加载页
│   │   │   │   └── page.tsx      # 评论管理页
│   │   │   ├── layout.tsx        # 管理后台布局（权限保护）
│   │   │   ├── loading.tsx       # 管理后台首页加载页
│   │   │   └── page.tsx          # 管理后台首页
│   │   ├── auth/                # 认证相关页面
│   │   │   ├── login/
│   │   │   │   └── page.tsx      # 登录页面
│   │   │   └── callback/
│   │   │       └── page.tsx      # OAuth 回调处理
│   │   ├── articles/
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx      # 文章详情页
│   │   │   └── page.tsx          # 文章列表页
│   │   ├── layout.tsx            # 根布局（包含AuthProvider）
│   │   ├── page.tsx              # 首页
│   │   └── globals.css           # 全局样式
│   ├── components/   # React 组件
│   │   ├── Navigation.tsx        # 导航栏组件（集成登录状态）
│   │   ├── Footer.tsx            # 页脚组件
│   │   ├── MainLayout.tsx        # 主布局容器
│   │   ├── AuthGuard.tsx         # 认证保护组件
│   │   ├── ArticleCard.tsx       # 文章卡片组件
│   │   ├── ArticleForm.tsx       # 文章表单组件
│   │   ├── SearchAndFilter.tsx   # 搜索筛选组件
│   │   ├── Pagination.tsx        # 分页组件
│   │   ├── DeleteArticleButton.tsx # 删除文章按钮
│   │   ├── TagForm.tsx           # 标签表单组件
│   │   ├── TagActions.tsx        # 标签操作组件
│   │   ├── comments/             # 评论系统组件
│   │   │   ├── CommentList.tsx   # 评论列表组件
│   │   │   ├── CommentForm.tsx   # 评论表单组件
│   │   │   ├── ArticleComments.tsx # 文章评论组合组件
│   │   │   ├── CommentManagement.tsx # 管理员评论管理组件
│   │   │   └── index.ts          # 评论组件导出
│   │   ├── skeletons/            # 加载骨架屏组件
│   │   │   ├── AdminPageSkeleton.tsx
│   │   │   ├── TableSkeleton.tsx
│   │   │   ├── ArticleFormSkeleton.tsx
│   │   │   ├── ArticlePreviewSkeleton.tsx
│   │   │   └── index.ts
│   │   └── index.ts              # 组件导出
│   ├── lib/          # 工具函数和数据访问层
│   │   ├── supabase.ts      # Supabase 客户端配置
│   │   ├── auth.ts          # 认证相关工具函数
│   │   ├── articles.ts      # 文章数据访问
│   │   ├── tags.ts          # 标签数据访问
│   │   ├── comments.ts      # 评论数据访问
│   │   ├── validations.ts   # API 数据验证规则
│   │   ├── api-utils.ts     # API 工具函数
│   │   └── utils.ts         # 通用工具函数
│   ├── contexts/     # React Context
│   │   └── AuthContext.tsx  # 认证状态管理
│   └── types/        # TypeScript 类型定义
│       └── database.ts      # 数据库类型（已扩展用户类型）
├── database/         # 数据库脚本
│   ├── schema.sql            # 基础数据库表结构
│   └── auth-extension.sql    # 用户认证系统扩展
├── docs/            # 项目文档
│   └── supabase-setup-guide.md
└── public/          # 静态资源
```

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

## 🚀 性能优化 - ISR 增量静态再生

### ISR 实现特性

- **多层缓存策略**：根据内容更新频率设置不同的重新验证时间
- **智能预生成**：在构建时预生成最重要的页面
- **混合架构**：静态生成 + 客户端交互的最佳平衡
- **SEO 友好**：动态生成的 metadata 和 Open Graph 支持

### 缓存策略

```typescript
// ISR 缓存配置
export const ISR_CONFIG = {
  HOME_REVALIDATE: 600, // 首页: 10分钟
  ARTICLE_REVALIDATE: 3600, // 文章详情: 1小时
  ARTICLES_LIST_REVALIDATE: 1800, // 文章列表: 30分钟
  TAG_PAGE_REVALIDATE: 1200, // 标签页: 20分钟
};
```

### 预生成策略

- **首页**：展示最新 6 篇文章，每 10 分钟更新
- **文章详情页**：预生成最新 20 篇文章，每小时更新
- **文章列表页**：混合架构，基础页面静态生成，搜索功能客户端渲染
- **标签页**：为每个标签预生成第一页

### 性能优化效果

- **首屏加载速度**：静态生成的页面可以直接从 CDN 提供
- **SEO 优化**：服务器端渲染确保搜索引擎可以正确索引
- **用户体验**：即时加载的静态内容 + 必要的动态功能
- **服务器负载**：减少数据库查询，提升整体性能

## 🔐 智能认证系统

### OAuth 域名自动适配

本项目实现了智能的 OAuth 认证系统，使用 Next.js 推荐的 `headers().get('origin')` 方法自动获取当前域名：

```typescript
// 服务端 API 路由 (/api/auth/signin)
const origin = request.headers.get("origin");
const redirectUrl = `${origin}/auth/callback`;

const { data, error } = await supabase.auth.signInWithOAuth({
  provider: provider as Provider,
  options: { redirectTo: redirectUrl },
});
```

## 🚀 部署

项目最终将部署到 Vercel 平台，利用其无服务器函数和全球 CDN 优化性能。ISR 功能在 Vercel 上可以获得最佳的缓存和性能表现。
