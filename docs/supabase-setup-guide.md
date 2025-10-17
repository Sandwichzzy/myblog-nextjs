# Supabase 数据库设置指南

## 🚀 快速开始

### 1. 创建 Supabase 项目

1. 访问 [database.new](https://database.new)
2. 点击 "New Project"
3. 填写项目信息：
   - **名称**: `my-blog`
   - **密码**: 设置强密码（请记住！）
   - **地区**: 选择最近的地区
4. 等待 2-3 分钟创建完成

### 2. 获取连接信息

1. 进入项目仪表板
2. 点击 `Settings` → `API`
3. 复制以下信息：
   ```
   Project URL: https://xxx.supabase.co
   Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI...
   Service Role Key: eyJhbGciOiJIUzI1NiIsInR5cCI...
   ```

### 3. 更新环境变量

更新项目根目录的 `.env.local` 文件：

```env
NEXT_PUBLIC_SUPABASE_URL=你的项目URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Anon密钥
SUPABASE_SERVICE_ROLE_KEY=你的Service Role密钥
```

### 4. 初始化数据库

在 Supabase SQL 编辑器中按顺序执行以下脚本：

#### 4.1 基础表结构
```sql
-- 复制 database/schema.sql 的内容并执行
```

#### 4.2 用户认证扩展
```sql
-- 复制 database/auth-extension.sql 的内容并执行
```

#### 4.3 修复 RLS 递归问题
```sql
-- 复制 database/fix-rls-recursion.sql 的内容并执行
```

#### 4.4 修复评论用户验证
```sql
-- 复制 database/fix-comment-user-auth.sql 的内容并执行
```

#### 4.5 RPC 函数
```sql
-- 复制 database/rpc-functions.sql 的内容并执行
```

#### 4.6 Git 仓库字段（可选）
```sql
-- 复制 database/add-git-repo-url.sql 的内容并执行
```

#### 4.7 图片存储配置
```sql
-- 复制 database/storage-setup.sql 的内容并执行
```

### 5. 验证数据库创建

1. 点击 `Table Editor`
2. 检查是否有以下表：
   - ✅ `articles` - 文章表（包含 git_repo_url 字段）
   - ✅ `tags` - 标签表
   - ✅ `article_tags` - 关联表
   - ✅ `comments` - 评论表（包含 user_id 字段）
   - ✅ `user_profiles` - 用户配置表

### 6. 查看示例数据

在 Table Editor 中：

**Tags 表应该包含**：
| name | color |
|------|-------|
| JavaScript | #F7DF1E |
| React | #61DAFB |
| Next.js | #000000 |
| TypeScript | #3178C6 |
| CSS | #1572B6 |
| Node.js | #339933 |

**Articles 表应该包含**：
| title | slug | published |
|-------|------|-----------|
| Welcome to My Blog | welcome-to-my-blog | true |
| Getting Started with Next.js | getting-started-with-nextjs | true |

## 🎯 Supabase 可视化功能

### Table Editor 功能

- 📊 **数据浏览**: 查看和搜索表数据
- ✏️ **在线编辑**: 直接编辑表数据
- 🔗 **关系视图**: 查看表之间的关联关系
- 📥 **数据导入**: 支持 CSV 导入
- 🔍 **实时筛选**: 按条件筛选数据

### SQL Editor 功能

- 💻 **SQL 查询**: 执行自定义 SQL 语句
- 📋 **查询历史**: 保存和重用查询
- 📊 **结果导出**: 导出查询结果
- ⚡ **性能分析**: 查看查询执行计划

### API 文档

- 🔌 **自动生成**: 基于表结构自动生成 API 文档
- 🧪 **在线测试**: 直接在浏览器中测试 API
- 📝 **代码示例**: 提供多种语言的代码示例

## 🔧 常用操作

### 添加新文章数据

```sql
INSERT INTO articles (title, slug, content, excerpt, published) VALUES (
  '我的第一篇文章',
  'my-first-article',
  '# 这是我的第一篇文章\n\n文章内容...',
  '这是文章摘要',
  true
);
```

### 添加新标签

```sql
INSERT INTO tags (name, color) VALUES ('Vue.js', '#4FC08D');
```

### 为文章添加标签

```sql
INSERT INTO article_tags (article_id, tag_id)
SELECT a.id, t.id
FROM articles a, tags t
WHERE a.slug = 'my-first-article' AND t.name = 'Vue.js';
```

### 查看文章及其标签

```sql
SELECT
  a.title,
  a.slug,
  string_agg(t.name, ', ') as tags
FROM articles a
LEFT JOIN article_tags at ON a.id = at.article_id
LEFT JOIN tags t ON at.tag_id = t.id
WHERE a.published = true
GROUP BY a.id, a.title, a.slug
ORDER BY a.created_at DESC;
```

## 🛟 故障排除

### 常见错误

**1. 权限不足错误**

```
permission denied for table articles
```

**解决方案**: 检查 RLS 策略是否正确设置

**2. 外键约束错误**

```
foreign key constraint fails
```

**解决方案**: 确保引用的记录存在

**3. 唯一约束错误**

```
duplicate key value violates unique constraint
```

**解决方案**: 检查 slug 或 tag name 是否重复

### 重置数据库

如果需要重新开始，可以删除所有表：

```sql
-- 删除表（注意顺序，先删除有外键依赖的表）
DROP TABLE IF EXISTS article_tags CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- 删除函数
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS increment_view_count(UUID) CASCADE;
DROP FUNCTION IF EXISTS create_user_profile() CASCADE;
DROP FUNCTION IF EXISTS get_tags_with_count() CASCADE;

-- 删除触发器（如果单独删除）
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 删除存储桶策略
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
```

然后按照第4步的顺序重新执行所有SQL脚本。

## 📞 支持资源

- 📚 [Supabase 官方文档](https://supabase.com/docs)
- 💬 [Supabase Discord 社区](https://discord.supabase.com)
- 🎥 [YouTube 教程](https://www.youtube.com/c/supabase)
- 📧 [技术支持](https://supabase.com/support)
