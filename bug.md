1. 首页应该显示最新的三篇文章，而不是默认 （已解决）
2. 创建新文章时，标签选择和跳转问题 （已解决）
3. 创建文章标签支持多选问题 （已解决）
4. 标签 ID undefined 导致全部选中问题 （已解决）
5. admin 下无法删除 published=false 的草稿，也无法查看和编辑草稿文章 （已解决）

## 第 7 个问题的三个子问题修复说明：

### 问题 7.1：编辑草稿文章返回 404

**根本原因**：编辑页面使用了 `getArticleBySlug` 函数，该函数只返回已发布文章
**修复方案**：

- 在 `src/lib/articles.ts` 中新增 `getArticleBySlugAdmin` 函数
- 修改 `src/app/admin/articles/[slug]/edit/page.tsx` 使用管理员专用函数

### 问题 7.2：删除草稿文章报错

**根本原因**：DELETE 和 PUT API 路由使用了 `getArticleBySlug` 函数检查文章存在性
**修复方案**：

- 修改 `src/app/api/articles/[slug]/route.ts` 中的 DELETE 和 PUT 处理器
- 使用 `getArticleBySlugAdmin` 函数替换原有的检查逻辑

### 问题 7.3：草稿文章出现在前台文章列表

**根本原因**：文章 API 路由中的逻辑错误，开发环境下错误地返回了所有文章
**修复方案**：

- 修改 `src/app/api/articles/route.ts` 中的 GET 处理器
- 移除 `(published === undefined && process.env.NODE_ENV === "development")` 条件
- 确保只有明确请求 `published=false` 时才返回草稿文章

### 新增功能：

- 创建了管理员专用的预览页面 `/admin/articles/[slug]/preview`
- 修改了管理后台的"查看"按钮逻辑，已发布文章链接到前台，草稿文章链接到预览页面

---

## 第 8 个问题：缓存刷新问题 （已解决）

### 问题描述：

当新建并立即发布新文章后，跳转到/articles 页面没有刷新出刚刚新发布的文章

### 根本原因：

1. 文章列表 API 设置了 5 分钟的缓存，新文章创建后缓存未失效
2. 前端跳转到文章列表时，API 返回的是缓存的旧数据
3. 没有缓存失效或强制刷新机制

### 修复方案：

1. **添加强制刷新机制**：

   - 修改 `ArticleForm` 组件，创建文章成功后跳转时添加 refresh 参数
   - 修改 `src/app/articles/page.tsx` 检测 refresh 参数并强制刷新数据
   - 在强制刷新时使用 `cache: "no-cache"` 和时间戳参数绕过缓存

2. **优化缓存策略**：

   - 将文章列表 API 缓存时间从 5 分钟减少到 1 分钟
   - 保持功能的同时减少用户等待时间

3. **用户体验优化**：
   - 强制刷新后自动清除 URL 中的 refresh 参数
   - 避免用户刷新页面时重复触发强制刷新

---

## 第 9 个问题：评论系统用户身份验证问题 （已解决）

### 问题描述：

无论是管理员还是登录用户都无法评论，未登录用户可以查看评论但无法提交评论。

### 根本原因：

1. 评论表缺少 `user_id` 字段，无法关联用户身份
2. 数据库 RLS 策略引用了不存在的 `user_id` 字段，导致数据库错误
3. 评论创建 API 没有进行用户身份验证
4. 评论表单组件没有正确处理身份验证令牌

### 修复方案：

1. **数据库结构修复**：

   - 创建了 `database/fix-comment-user-auth.sql` 修复脚本
   - 添加 `user_id` 字段到评论表
   - 重新配置 RLS 策略，只允许登录用户创建评论
   - 创建适当的索引优化查询性能

2. **API 身份验证修复**：

   - 修改 `src/app/api/comments/route.ts` 中的 POST 处理器
   - 添加用户身份验证检查
   - 确保评论与用户身份正确关联
   - 添加访问令牌验证

3. **前端组件修复**：
   - 修改 `src/components/comments/CommentForm.tsx`
   - 添加用户登录状态检查
   - 包含身份验证令牌在请求中
   - 为未登录用户显示友好提示

### 修复文件：

- `database/fix-comment-user-auth.sql` - 数据库结构和 RLS 策略修复
- `src/app/api/comments/route.ts` - API 身份验证修复
- `src/components/comments/CommentForm.tsx` - 前端组件修复
- `README.md` - 更新环境配置说明

### 测试验证：

- 未登录用户无法提交评论，显示登录提示
- 登录用户可以正常提交评论
- 评论与用户身份正确关联
- 管理员可以正常管理所有评论
- 已发布的评论可以正常显示给所有用户
