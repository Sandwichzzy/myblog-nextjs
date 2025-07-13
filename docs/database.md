# 数据库架构文档

本文档详细描述了个人博客系统的完整数据库架构，包括表结构、函数、策略和索引等。

## 📋 目录

1. [表结构](#表结构)
2. [函数列表](#函数列表)
3. [RLS 策略](#rls-策略)
4. [索引列表](#索引列表)
5. [触发器](#触发器)
6. [数据访问模式](#数据访问模式)

## 📊 表结构

### 核心业务表

#### 1. `articles` - 文章表

```sql
CREATE TABLE articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,                    -- 文章标题
  slug VARCHAR(255) UNIQUE NOT NULL,              -- URL 友好标识符
  content TEXT NOT NULL,                          -- 文章正文 (Markdown)
  excerpt TEXT,                                   -- 文章摘要
  author_id UUID,                                 -- 作者 ID (预留字段)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published BOOLEAN DEFAULT false,                -- 发布状态
  view_count INTEGER DEFAULT 0                    -- 浏览量
);
```

**特性：**

- ✅ 支持草稿和发布状态
- ✅ 自动浏览量统计
- ✅ URL 友好的 slug
- ✅ 自动时间戳管理

#### 2. `tags` - 标签表

```sql
CREATE TABLE tags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,              -- 标签名称
  color VARCHAR(7) DEFAULT '#3B82F6',             -- 十六进制颜色值
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**特性：**

- ✅ 唯一约束防重复
- ✅ 自定义颜色支持
- ✅ 预设默认颜色

#### 3. `article_tags` - 文章标签关联表

```sql
CREATE TABLE article_tags (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (article_id, tag_id)                -- 复合主键防重复
);
```

**特性：**

- ✅ 多对多关联
- ✅ 级联删除保证一致性
- ✅ 复合主键防重复关联

#### 4. `comments` - 评论表

```sql
CREATE TABLE comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  author_name VARCHAR(100) NOT NULL,              -- 评论者姓名
  author_email VARCHAR(255),                      -- 评论者邮箱
  content TEXT NOT NULL,                          -- 评论内容
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- 关联用户 (认证用户)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published BOOLEAN DEFAULT false                 -- 审核状态
);
```

**特性：**

- ✅ 支持匿名和认证用户评论
- ✅ 评论审核机制
- ✅ 级联删除

### 用户认证表

#### 5. `user_profiles` - 用户配置表

```sql
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')), -- 用户角色
  display_name VARCHAR(100),                      -- 显示名称
  avatar_url TEXT,                                -- 头像 URL
  bio TEXT,                                       -- 个人简介
  website VARCHAR(255),                           -- 个人网站
  is_active BOOLEAN DEFAULT true,                 -- 是否启用
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**特性：**

- ✅ 扩展 Supabase Auth 用户信息
- ✅ 角色权限管理 (admin/user)
- ✅ 用户状态控制
- ✅ 丰富的用户配置选项

## ⚙️ 函数列表

### 业务逻辑函数

#### 1. `increment_view_count(article_id UUID)` - 增加文章浏览量

```sql
CREATE OR REPLACE FUNCTION increment_view_count(article_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE articles
  SET view_count = view_count + 1
  WHERE id = article_id;
END;
$$ language 'plpgsql';
```

**用途：** 原子性地增加文章浏览量，避免并发问题

#### 2. `promote_first_user_to_admin()` - 提升首个用户为管理员

```sql
CREATE OR REPLACE FUNCTION promote_first_user_to_admin()
RETURNS void AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE role = 'admin') THEN
    UPDATE user_profiles
    SET role = 'admin'
    WHERE id = (
      SELECT id FROM user_profiles
      ORDER BY created_at ASC
      LIMIT 1
    );
  END IF;
END;
$$ language 'plpgsql' SECURITY DEFINER;
```

**用途：** 自动将第一个注册用户设置为管理员

### 权限检查函数

#### 3. `check_is_admin(user_id UUID)` - 检查管理员权限

```sql
CREATE OR REPLACE FUNCTION check_is_admin(user_id UUID DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = user_id AND role = 'admin' AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**用途：** 安全地检查用户是否为活跃管理员

#### 4. `get_user_role_safe(user_id UUID)` - 获取用户角色

```sql
CREATE OR REPLACE FUNCTION get_user_role_safe(user_id UUID DEFAULT auth.uid())
RETURNS text AS $$
BEGIN
  RETURN (
    SELECT role FROM user_profiles
    WHERE id = user_id AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**用途：** 安全地获取用户角色信息

#### 5. `is_admin(user_id UUID)` - 管理员权限检查 (兼容性)

```sql
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  RETURN check_is_admin(user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**用途：** 向后兼容的管理员权限检查

### 触发器函数

#### 6. `update_updated_at_column()` - 自动更新时间戳

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';
```

**用途：** 在记录更新时自动设置 updated_at 字段

#### 7. `create_user_profile()` - 自动创建用户配置

```sql
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;
```

**用途：** 用户注册时自动创建用户配置记录

## 🛡️ RLS 策略

### 文章表策略 (`articles`)

```sql
-- 所有人可以查看已发布文章
CREATE POLICY "Everyone can read published articles" ON articles
  FOR SELECT USING (published = true);

-- 认证用户可以创建文章
CREATE POLICY "Authenticated users can create articles" ON articles
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
```

**注意：** 管理员对文章的完全访问通过 supabaseAdmin 客户端处理

### 评论表策略 (`comments`)

```sql
-- 所有人可以查看已发布评论
CREATE POLICY "Everyone can read published comments" ON comments
  FOR SELECT USING (published = true);

-- 认证用户可以创建评论
CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 用户可以查看自己的评论
CREATE POLICY "Users can view own comments" ON comments
  FOR SELECT USING (user_id = auth.uid());
```

### 标签表策略 (`tags`)

```sql
-- 所有人可以查看标签
CREATE POLICY "Everyone can read tags" ON tags
  FOR SELECT USING (true);
```

### 用户配置表策略 (`user_profiles`)

```sql
-- 允许配置创建 (用于注册触发器)
CREATE POLICY "Allow profile creation" ON user_profiles
  FOR INSERT WITH CHECK (true);

-- 用户可以查看自己的配置
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- 用户可以更新自己的配置
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 认证用户可以查看基本信息
CREATE POLICY "Authenticated users can view basic info" ON user_profiles
  FOR SELECT USING (
    auth.uid() IS NOT NULL
    AND is_active = true
  );
```

## 📚 索引列表

### 性能优化索引

#### 文章表索引

```sql
CREATE INDEX idx_articles_published ON articles(published);        -- 发布状态查询
CREATE INDEX idx_articles_created_at ON articles(created_at DESC); -- 时间排序
CREATE INDEX idx_articles_slug ON articles(slug);                  -- URL 查找
CREATE INDEX articles_search_idx ON articles
  USING gin(to_tsvector('english', title || ' ' || content));      -- 全文搜索
```

#### 评论表索引

```sql
CREATE INDEX idx_comments_article_id ON comments(article_id);      -- 文章评论查询
CREATE INDEX idx_comments_published ON comments(published);        -- 审核状态查询
CREATE INDEX idx_comments_user_id ON comments(user_id);           -- 用户评论查询
```

#### 用户配置表索引

```sql
CREATE INDEX idx_user_profiles_role ON user_profiles(role);        -- 角色查询
CREATE INDEX idx_user_profiles_active ON user_profiles(is_active); -- 活跃状态查询
```

## 🔄 触发器

### 自动时间戳触发器

```sql
CREATE TRIGGER update_articles_updated_at
  BEFORE UPDATE ON articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**作用：** 文章更新时自动设置 updated_at 字段

### 用户注册触发器

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();
```

**作用：** 用户注册时自动创建用户配置记录

## 🔐 数据访问模式

### 客户端访问权限

#### 普通客户端 (`supabase`)

- ✅ 查看已发布文章
- ✅ 查看已发布评论
- ✅ 查看所有标签
- ✅ 创建文章/评论 (认证用户)
- ✅ 管理自己的配置

#### 管理员客户端 (`supabaseAdmin`)

- ✅ 完全访问所有文章 (包括草稿)
- ✅ 完全访问所有评论 (包括待审核)
- ✅ 管理标签
- ✅ 管理用户配置
- ✅ 绕过所有 RLS 策略

### 权限分离策略

1. **读取权限**：通过 RLS 策略控制
2. **管理权限**：通过应用层 + supabaseAdmin 客户端控制
3. **用户认证**：基于 Supabase Auth
4. **角色管理**：基于 user_profiles.role 字段

## 📈 扩展性设计

### 已预留的扩展点

1. **多作者支持**：articles.author_id 字段
2. **评论回复**：可扩展 comments 表添加 parent_id
3. **文章分类**：可添加 categories 表
4. **用户关注**：可添加 follows 表
5. **文章点赞**：可添加 likes 表

### 性能优化建议

1. **分页查询**：使用 LIMIT + OFFSET 或游标分页
2. **缓存策略**：对热门文章和标签进行缓存
3. **全文搜索**：已集成 PostgreSQL GIN 索引
4. **图片优化**：建议使用 CDN 存储图片

## 🔧 维护说明

### 定期维护任务

1. **清理测试数据**：删除开发环境的示例数据
2. **重建索引**：定期 REINDEX 提升查询性能
3. **统计信息更新**：ANALYZE 表以优化查询计划
4. **日志清理**：清理 Supabase 认证日志

### 监控指标

1. **文章浏览量**：articles.view_count
2. **评论审核率**：comments.published 统计
3. **用户活跃度**：user_profiles.is_active 统计
4. **查询性能**：监控慢查询日志

---

**最后更新时间：** 2024 年 12 月

**架构版本：** v2.0 (包含认证系统)
