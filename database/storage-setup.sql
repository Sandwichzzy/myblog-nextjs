-- ============================================================================
-- Supabase Storage 配置
-- ============================================================================
-- 设置图片存储桶和权限策略
-- ============================================================================

-- 创建 images 存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 允许所有用户查看图片（公开读取）
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

-- 允许认证用户上传图片
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' 
  AND auth.role() = 'authenticated'
);

-- 允许用户删除自己上传的图片
CREATE POLICY "Users can delete own images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 允许管理员删除所有图片
CREATE POLICY "Admins can delete all images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images' 
  AND EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 允许用户更新自己上传的图片
CREATE POLICY "Users can update own images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 允许管理员更新所有图片
CREATE POLICY "Admins can update all images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'images' 
  AND EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
); 