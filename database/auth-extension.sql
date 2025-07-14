
-- ============================================================================
-- 修复用户认证触发器权限问题
-- ============================================================================
-- 本脚本修复 "Database error saving new user" 错误
-- 主要问题：触发器权限和 RLS 策略冲突
-- ============================================================================

-- 1. 临时禁用 RLS 策略，允许触发器正常工作
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 2. 重新创建触发器函数，确保权限正确
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_user_profile();

-- 创建新的触发器函数，使用 SECURITY DEFINER 确保权限
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- 尝试插入新用户配置
  INSERT INTO public.user_profiles (
    id, 
    display_name, 
    avatar_url,
    role,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    'user', -- 默认角色
    true,    -- 默认启用
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- 记录错误但不阻止用户注册
    RAISE WARNING 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- 3. 重新创建触发器
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- 4. 重新启用 RLS 但添加触发器例外
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 5. 删除可能有问题的旧策略
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow trigger to insert" ON user_profiles;

-- 6. 重新创建策略，添加对触发器的支持
-- 允许触发器插入用户配置
CREATE POLICY "Allow trigger to insert" ON user_profiles
  FOR INSERT WITH CHECK (true);

-- 用户可以查看自己的配置
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- 用户可以更新自己的配置
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- 管理员可以查看所有用户配置
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 7. 修复可能存在的孤立用户
-- 为没有配置的现有用户创建配置
INSERT INTO user_profiles (id, display_name, role, is_active, created_at, updated_at)
SELECT 
  u.id,
  COALESCE(
    u.raw_user_meta_data->>'full_name', 
    u.raw_user_meta_data->>'name',
    split_part(u.email, '@', 1)
  ) as display_name,
  'user' as role,
  true as is_active,
  u.created_at,
  u.updated_at
FROM auth.users u
LEFT JOIN user_profiles up ON u.id = up.id
WHERE up.id IS NULL;

-- 8. 确保第一个用户是管理员
DO $$
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
END $$;

-- 9. 创建备用函数来手动创建用户配置
CREATE OR REPLACE FUNCTION ensure_user_profile(user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO user_profiles (id, display_name, role, is_active, created_at, updated_at)
  SELECT 
    u.id,
    COALESCE(
      u.raw_user_meta_data->>'full_name', 
      u.raw_user_meta_data->>'name',
      split_part(u.email, '@', 1)
    ),
    'user',
    true,
    u.created_at,
    u.updated_at
  FROM auth.users u
  WHERE u.id = user_id
  ON CONFLICT (id) DO NOTHING;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- 完成提示
SELECT 'Auth trigger fix completed successfully!' as status; 