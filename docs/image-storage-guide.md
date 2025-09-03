# 图片存储配置指南

本指南将帮助您配置博客系统的图片存储功能，实现图片的上传、显示和管理。

## 🔧 Supabase Storage 配置

### 1. 创建存储桶

在 Supabase Dashboard 中：

1. 进入 **Storage** 页面
2. 点击 **New bucket**
3. 输入桶名称：`images`
4. 设置为 **Public bucket**（公开访问）
5. 点击 **Create bucket**

### 2. 配置权限策略

在 Supabase SQL Editor 中运行以下脚本：

```sql
-- 执行 Storage 配置脚本
\i database/storage-setup.sql
```

或者手动执行：

```sql
-- 创建 images 存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- 允许所有用户查看图片
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

-- 允许认证用户上传图片
CREATE POLICY "Authenticated users can upload images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images'
  AND auth.role() = 'authenticated'
);
```

### 3. 验证配置

1. 在 Storage 页面查看 `images` 桶是否创建成功
2. 尝试手动上传一张测试图片
3. 检查图片是否可以公开访问

## 🖼️ 使用图片上传功能

### 在文章编辑器中

1. 打开文章创建/编辑页面
2. 在 Markdown 编辑器工具栏中点击 🖼️ 图片按钮
3. 拖拽图片文件到上传区域或点击选择文件
4. 图片上传成功后会自动插入 Markdown 语法

### 支持的图片格式

- **JPEG** (.jpg, .jpeg)
- **PNG** (.png)
- **GIF** (.gif)
- **WebP** (.webp)

### 图片大小限制

- 最大文件大小：**5MB**
- 自动压缩：宽度超过 1200px 时自动压缩
- 压缩质量：80%

## 📁 文件组织结构

图片将按照以下结构存储：

```
images/
├── articles/          # 文章图片
│   ├── 1640995200000_abc123.jpg
│   └── 1640995201000_def456.png
├── avatars/          # 用户头像
└── uploads/          # 其他上传文件
```

## 🔒 权限管理

### 用户权限

- **游客**：只能查看公开图片
- **登录用户**：可以上传图片，删除自己的图片
- **管理员**：可以管理所有图片

### 安全特性

- 文件类型验证
- 文件大小限制
- 自动生成唯一文件名
- 防止路径遍历攻击

## 🚀 性能优化

### Next.js Image 优化

- 自动格式转换（WebP）
- 响应式图片加载
- 延迟加载（Lazy Loading）
- 自动大小调整

### CDN 加速

Supabase Storage 自带全球 CDN，图片加载速度快：

```
https://your-project.supabase.co/storage/v1/object/public/images/articles/image.jpg
```

## 🛠️ 故障排除

### 常见问题

**1. 图片上传失败**

```
错误：上传失败: The resource already exists
```

**解决方案**：文件名冲突，系统会自动重试

**2. 图片无法显示**

```
错误：Failed to construct 'URL': Invalid URL
```

**解决方案**：

- 检查图片 URL 是否正确
- 确认 Next.js 配置中已添加 Supabase 域名
- 验证 Storage 权限策略

**3. 权限不足**

```
错误：new row violates row-level security policy
```

**解决方案**：

- 确保用户已登录
- 检查 Storage 权限策略
- 验证用户角色

### 调试步骤

1. **检查网络请求**：在浏览器开发者工具中查看上传请求
2. **验证权限**：在 Supabase Dashboard 中检查用户权限
3. **查看日志**：检查服务器端错误日志
4. **测试 API**：使用 Postman 等工具测试上传 API

## 📊 使用统计

### 存储用量监控

在 Supabase Dashboard > Settings > Usage 中可以查看：

- 存储空间使用量
- 带宽使用量
- 请求次数统计

### 成本优化

- 定期清理无用图片
- 使用图片压缩减少存储空间
- 合理设置缓存策略

## 🔄 备份与迁移

### 数据备份

```bash
# 下载所有图片（需要 Supabase CLI）
supabase storage download --bucket images --recursive ./backup/
```

### 迁移到其他服务

如需迁移到其他图片存储服务（如 AWS S3、Cloudinary），可以：

1. 修改 `src/lib/image-upload.ts` 中的上传逻辑
2. 更新 `next.config.ts` 中的图片域名配置
3. 批量迁移现有图片数据

## 📝 最佳实践

1. **图片命名**：使用描述性的 alt 文本
2. **尺寸优化**：上传前适当压缩图片
3. **格式选择**：
   - 照片使用 JPEG
   - 图标使用 PNG
   - 动画使用 GIF
4. **SEO 优化**：为图片添加有意义的 alt 属性

## 🎯 高级功能

### 图片处理

可以扩展功能支持：

- 图片裁剪
- 添加水印
- 格式转换
- 尺寸变换

### 批量操作

- 批量上传
- 批量删除
- 批量重命名
- 批量压缩

这些功能可以根据需求进行开发扩展。
