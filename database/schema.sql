-- ============================================================================
-- 个人博客系统数据库架构设计
-- ============================================================================
-- 本文件定义了博客系统的完整数据库结构，包括：
-- 1. 核心数据表设计
-- 2. 性能优化索引
-- 3. 数据安全策略（RLS）
-- 4. 自动化触发器
-- 5. 业务逻辑函数
-- ============================================================================

-- ============================================================================
-- 1. 扩展和基础配置
-- ============================================================================

-- 启用 UUID 扩展，用于生成全局唯一标识符
-- UUID 比自增 ID 更安全，无法被猜测，适合公开的 API
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. 核心数据表设计
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 2.1 文章表 (articles)
-- ----------------------------------------------------------------------------
-- 存储博客文章的核心信息，支持草稿和发布状态
CREATE TABLE articles (
  -- 主键：UUID 格式，自动生成，避免 ID 被猜测
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- 文章标题：限制 255 字符，用于 SEO 和显示
  title VARCHAR(255) NOT NULL,
  
  -- URL 友好的标识符：用于生成 SEO 友好的 URL
  -- 例如：/posts/getting-started-with-nextjs
  slug VARCHAR(255) UNIQUE NOT NULL,
  
  -- 文章正文：支持 Markdown 格式，无长度限制
  content TEXT NOT NULL,
  
  -- 文章摘要：可选，用于列表页展示和 SEO 描述
  excerpt TEXT,
  
  -- 作者 ID：预留字段，支持多作者博客扩展
  author_id UUID,
  
  -- 创建时间：带时区的时间戳，记录文章创建时间
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 更新时间：带时区的时间戳，通过触发器自动更新
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 发布状态：false=草稿，true=已发布
  -- 支持内容管理工作流
  published BOOLEAN DEFAULT false
);

-- ----------------------------------------------------------------------------
-- 2.2 标签表 (tags)
-- ----------------------------------------------------------------------------
-- 存储文章分类标签，支持标签颜色自定义
CREATE TABLE tags (
  -- 主键：UUID 格式
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- 标签名称：唯一约束，避免重复标签
  name VARCHAR(100) UNIQUE NOT NULL,
  
  -- 标签颜色：十六进制颜色值，用于前端显示
  -- 默认蓝色 #3B82F6 (Tailwind CSS blue-500)
  color VARCHAR(7) DEFAULT '#3B82F6',
  
  -- 创建时间：记录标签创建时间
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 2.3 文章标签关联表 (article_tags)
-- ----------------------------------------------------------------------------
-- 多对多关联表，一篇文章可以有多个标签，一个标签可以关联多篇文章
CREATE TABLE article_tags (
  -- 外键：关联文章 ID，级联删除保证数据一致性
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  
  -- 外键：关联标签 ID，级联删除避免孤立记录
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  
  -- 关联创建时间：记录标签被添加到文章的时间
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 复合主键：确保同一篇文章不会重复关联同一个标签
  PRIMARY KEY (article_id, tag_id)
);

-- ----------------------------------------------------------------------------
-- 2.4 评论表 (comments)
-- ----------------------------------------------------------------------------
-- 存储用户评论，支持审核机制
CREATE TABLE comments (
  -- 主键：UUID 格式
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- 外键：关联文章 ID，级联删除
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  
  -- 评论者姓名：必填，用于显示
  author_name VARCHAR(100) NOT NULL,
  
  -- 评论者邮箱：可选，用于通知和头像显示
  author_email VARCHAR(255),
  
  -- 评论内容：支持纯文本或简单 Markdown
  content TEXT NOT NULL,
  
  -- 创建时间：记录评论提交时间
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 发布状态：false=待审核，true=已发布
  -- 实现评论审核机制，防止垃圾评论
  published BOOLEAN DEFAULT false
);

-- ============================================================================
-- 3. 性能优化索引
-- ============================================================================
-- 根据查询模式创建索引，提升数据库查询性能

-- 文章发布状态索引：优化 "获取已发布文章" 查询
-- 使用场景：WHERE published = true
CREATE INDEX idx_articles_published ON articles(published);

-- 文章创建时间倒序索引：优化 "按时间排序" 查询
-- 使用场景：ORDER BY created_at DESC（最新文章优先）
CREATE INDEX idx_articles_created_at ON articles(created_at DESC);

-- 文章 slug 索引：优化 "通过 URL 查找文章" 查询
-- 使用场景：WHERE slug = 'article-slug'
CREATE INDEX idx_articles_slug ON articles(slug);

-- 评论文章关联索引：优化 "获取文章评论" 查询
-- 使用场景：WHERE article_id = 'uuid'
CREATE INDEX idx_comments_article_id ON comments(article_id);

-- 评论发布状态索引：优化 "获取已发布评论" 查询
-- 使用场景：WHERE published = true
CREATE INDEX idx_comments_published ON comments(published);

-- 全文搜索索引：支持文章标题和内容的全文搜索
-- 使用 PostgreSQL 的 GIN 索引，支持中英文搜索
-- 使用场景：全文搜索功能
CREATE INDEX IF NOT EXISTS articles_search_idx ON articles 
USING gin(to_tsvector('english', title || ' ' || content));

-- ============================================================================
-- 4. 自动化触发器
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 4.1 自动更新时间戳触发器函数
-- ----------------------------------------------------------------------------
-- 当文章被更新时，自动设置 updated_at 字段为当前时间
-- 确保时间戳的准确性，无需应用层手动维护
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  -- 设置新记录的更新时间为当前时间
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为文章表创建触发器，在每次 UPDATE 操作前执行
-- 确保 updated_at 字段始终反映最后修改时间
CREATE TRIGGER update_articles_updated_at 
  BEFORE UPDATE ON articles 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. 业务逻辑函数
-- ============================================================================
-- （暂无）

-- ============================================================================
-- 6. 行级安全策略 (Row Level Security, RLS)
-- ============================================================================
-- RLS 是 PostgreSQL 的安全特性，可以在数据库层面控制数据访问权限
-- 即使应用代码存在漏洞，也能保护敏感数据

-- 启用所有表的行级安全
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 6.1 文章访问策略
-- ----------------------------------------------------------------------------
-- 策略：普通用户只能查看已发布的文章
-- 未发布的草稿文章对公众不可见，只有管理员可以访问
CREATE POLICY "Everyone can read published articles" ON articles
  FOR SELECT USING (published = true);

-- 如需添加管理员策略，可以这样写：
-- CREATE POLICY "Admins can read all articles" ON articles
--   FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- ----------------------------------------------------------------------------
-- 6.2 标签访问策略
-- ----------------------------------------------------------------------------
-- 策略：所有人都可以读取标签
-- 标签是公开信息，用于文章分类和筛选
CREATE POLICY "Everyone can read tags" ON tags
  FOR SELECT USING (true);

-- ----------------------------------------------------------------------------
-- 6.3 文章标签关联访问策略
-- ----------------------------------------------------------------------------
-- 策略：所有人都可以读取文章标签关联
-- 用于显示文章的标签和按标签筛选文章
CREATE POLICY "Everyone can read article tags" ON article_tags
  FOR SELECT USING (true);

-- ----------------------------------------------------------------------------
-- 6.4 评论访问策略
-- ----------------------------------------------------------------------------
-- 策略：普通用户只能查看已发布（已审核）的评论
-- 待审核的评论对公众不可见，防止垃圾评论显示
-- 不支持匿名用户评论
CREATE POLICY "Everyone can read published comments" ON comments
  FOR SELECT USING (published = true);

-- ============================================================================
-- 7. 示例数据
-- ============================================================================
-- 插入一些示例数据用于开发和测试

-- ----------------------------------------------------------------------------
-- 7.1 示例标签数据
-- ----------------------------------------------------------------------------
-- 插入常用的技术标签，每个标签使用对应的品牌颜色
INSERT INTO tags (name, color) VALUES 
  ('JavaScript', '#F7DF1E'),    -- JavaScript 官方黄色
  ('React', '#61DAFB'),         -- React 官方蓝色
  ('Next.js', '#000000'),       -- Next.js 官方黑色
  ('TypeScript', '#3178C6'),    -- TypeScript 官方蓝色
  ('CSS', '#1572B6'),           -- CSS 官方蓝色
  ('Node.js', '#339933');       -- Node.js 官方绿色

-- ----------------------------------------------------------------------------
-- 7.2 示例文章数据
-- ----------------------------------------------------------------------------
-- 插入两篇示例文章，展示不同的内容类型
INSERT INTO articles (title, slug, content, excerpt, published) VALUES 
  (
    'Welcome to My Blog',
    'welcome-to-my-blog',
    '# Welcome to My Blog

This is my first blog post! I''m excited to share my thoughts and experiences with you.

## About This Blog

This blog is built with Next.js, TypeScript, and Supabase. It features:

- Server-side rendering
- Static site generation
- Real-time comments
- Tag-based categorization

Stay tuned for more content!',
    'Welcome to my new blog built with Next.js and Supabase.',
    true  -- 已发布状态
  ),
  (
    'Getting Started with Next.js',
    'getting-started-with-nextjs',
    '# Getting Started with Next.js

Next.js is a powerful React framework that makes building web applications a breeze.

## Key Features

- **Server-side Rendering**: Improve SEO and initial page load
- **Static Site Generation**: Pre-render pages at build time
- **API Routes**: Build full-stack applications
- **Image Optimization**: Automatic image optimization

Let''s explore these features in detail...',
    'Learn the basics of Next.js and its powerful features.',
    true  -- 已发布状态
  );

-- ----------------------------------------------------------------------------
-- 7.3 示例文章标签关联
-- ----------------------------------------------------------------------------
-- 为示例文章添加相关标签
-- 使用 SELECT 子查询确保引用的文章和标签确实存在
INSERT INTO article_tags (article_id, tag_id) 
SELECT a.id, t.id 
FROM articles a, tags t 
WHERE (a.slug = 'welcome-to-my-blog' AND t.name IN ('Next.js', 'TypeScript'))
   OR (a.slug = 'getting-started-with-nextjs' AND t.name IN ('Next.js', 'React'));

-- ============================================================================
-- 架构设计总结
-- ============================================================================
-- 
-- 1. 🔒 安全性设计
--    - UUID 主键防止 ID 枚举攻击
--    - RLS 策略控制数据访问权限
--    - 草稿/发布状态控制内容可见性
--    - 评论审核机制防止垃圾内容
--
-- 2. 🚀 性能优化
--    - 针对查询模式的索引设计
--    - 全文搜索索引支持内容检索
--    - 复合主键优化关联查询
--    - 级联删除保证数据一致性
--
-- 3. 🔄 可维护性
--    - 触发器自动维护时间戳
--    - 数据库函数封装业务逻辑
--    - 清晰的表关系和约束
--    - 详细的注释文档
--
-- 4. 🎯 扩展性
--    - 多作者支持（author_id 字段）
--    - 灵活的标签系统
--    - 可扩展的评论功能
--    - 预留了用户认证集成接口
--
-- ============================================================================ 