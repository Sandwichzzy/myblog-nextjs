-- ============================================================================
-- 修复 RLS 策略循环递归问题
-- ============================================================================
-- 修复 "infinite recursion detected in policy" 错误
-- 移除有循环依赖的策略，使用更简单的策略
-- ============================================================================

-- 1. 删除文章表上的所有现有策略
DROP POLICY IF EXISTS "Everyone can read published articles" ON articles;
DROP POLICY IF EXISTS "Admins can read all articles" ON articles;
DROP POLICY IF EXISTS "Authenticated users can create articles" ON articles;
DROP POLICY IF EXISTS "Admins can manage all articles" ON articles;
DROP POLICY IF EXISTS "Users can view published articles" ON articles;

-- 2. 删除评论表上的所有现有策略
DROP POLICY IF EXISTS "Everyone can read published comments" ON comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON comments;
DROP POLICY IF EXISTS "Users can view own comments" ON comments;
DROP POLICY IF EXISTS "Admins can manage all comments" ON comments;
DROP POLICY IF EXISTS "Users can view published comments" ON comments;

-- 3. 删除标签表上的现有策略（如果有）
DROP POLICY IF EXISTS "Everyone can read tags" ON tags;
DROP POLICY IF EXISTS "Admins can manage tags" ON tags;

-- 4. 删除用户配置表上可能导致循环的策略
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow trigger to insert" ON user_profiles;
DROP POLICY IF EXISTS "Allow profile creation" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can view basic info" ON user_profiles;

-- 5. 安全删除旧函数
DROP FUNCTION IF EXISTS is_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS check_is_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_user_role_safe(UUID) CASCADE;

-- 6. 重新创建用户配置表策略（避免循环引用）
CREATE POLICY "Allow profile creation" ON user_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view basic info" ON user_profiles
  FOR SELECT USING (
    auth.uid() IS NOT NULL 
    AND is_active = true
  );

-- 7. 重新创建文章表策略（不使用 is_admin 函数）
CREATE POLICY "Everyone can read published articles" ON articles
  FOR SELECT USING (published = true);

CREATE POLICY "Authenticated users can create articles" ON articles
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 管理员对文章的完全访问将通过 supabaseAdmin 客户端处理

-- 8. 重新创建评论表策略（不使用 is_admin 函数）
CREATE POLICY "Everyone can read published comments" ON comments
  FOR SELECT USING (published = true);

CREATE POLICY "Authenticated users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view own comments" ON comments
  FOR SELECT USING (user_id = auth.uid());

-- 管理员对评论的管理将通过 supabaseAdmin 客户端处理

-- 9. 重新创建标签表策略（如果需要）
CREATE POLICY "Everyone can read tags" ON tags
  FOR SELECT USING (true);

-- 管理员对标签的管理将通过 supabaseAdmin 客户端处理

-- 10. 创建新的安全函数来检查管理员权限
CREATE OR REPLACE FUNCTION check_is_admin(user_id UUID DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  -- 直接返回布尔值，避免复杂的 RLS 交互
  -- 这个函数将在应用层通过 supabaseAdmin 调用
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = user_id AND role = 'admin' AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. 创建函数获取用户角色
CREATE OR REPLACE FUNCTION get_user_role_safe(user_id UUID DEFAULT auth.uid())
RETURNS text AS $$
BEGIN
  RETURN (
    SELECT role FROM user_profiles 
    WHERE id = user_id AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. 重新创建 is_admin 函数（为了向后兼容，但不在 RLS 策略中使用）
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  RETURN check_is_admin(user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 完成提示
SELECT 'RLS recursion fix completed successfully!' as status; 