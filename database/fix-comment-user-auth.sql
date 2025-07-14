-- ============================================================================
-- 修复评论系统用户身份验证
-- ============================================================================
-- 1. 添加 user_id 字段到评论表
-- 2. 修复 RLS 策略，只允许登录用户创建评论
-- 3. 确保评论与用户身份正确关联
-- ============================================================================

-- 1. 添加 user_id 字段到评论表
ALTER TABLE comments ADD COLUMN IF NOT EXISTS user_id UUID;

-- 2. 添加外键约束（如果存在 auth.users 表）
-- 注意：Supabase 中的 auth.users 表可能不支持外键，所以我们不添加外键约束
-- 但是我们会在应用层确保数据完整性

-- 3. 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);

-- 4. 删除现有的有问题的 RLS 策略
DROP POLICY IF EXISTS "Everyone can read published comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can view own comments" ON comments;
DROP POLICY IF EXISTS "Admins can manage all comments" ON comments;
DROP POLICY IF EXISTS "Users can view published comments" ON comments;
DROP POLICY IF EXISTS "Anyone can create comments" ON comments;

-- 5. 重新创建正确的 RLS 策略

-- 允许所有人查看已发布的评论
CREATE POLICY "Everyone can read published comments" ON comments
  FOR SELECT USING (published = true);

-- 只允许登录用户创建评论
CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL 
    AND user_id = auth.uid()
    AND article_id IS NOT NULL 
    AND author_name IS NOT NULL 
    AND content IS NOT NULL
    AND LENGTH(TRIM(author_name)) > 0
    AND LENGTH(TRIM(content)) > 0
  );

-- 允许用户查看自己的评论（无论是否发布）
CREATE POLICY "Users can view own comments" ON comments
  FOR SELECT USING (user_id = auth.uid());

-- 6. 确保评论表启用了 RLS
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 7. 更新现有评论的 user_id 字段（如果需要）
-- 注意：现有的评论可能没有 user_id，这些评论将保持为 NULL
-- 管理员可以通过 supabaseAdmin 客户端查看和管理所有评论

-- 8. 验证策略是否正确创建
SELECT 
  schemaname,
  tablename, 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'comments' 
ORDER BY policyname;

-- 完成提示
SELECT 'Comment user authentication fix completed successfully!' as status; 