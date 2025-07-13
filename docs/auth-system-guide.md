# 认证系统使用指南

本博客系统已集成完整的用户认证功能，支持 GitHub 和 Google OAuth 登录，具备完善的权限管理机制。

## 🚀 快速开始

### 1. 数据库设置

#### 运行基础表结构

```sql
-- 在 Supabase SQL 编辑器中运行
\i database/schema.sql
```

#### 运行认证扩展

```sql
-- 在 Supabase SQL 编辑器中运行
\i database/auth-extension.sql
```

### 2. Supabase Auth 配置

#### 在 Supabase Dashboard 中设置 OAuth 提供商：

**GitHub OAuth:**

1. 访问 GitHub > Settings > Developer settings > OAuth Apps
2. 创建新的 OAuth App
3. 设置回调 URL: `https://your-project.supabase.co/auth/v1/callback`
4. 在 Supabase Dashboard > Authentication > Providers 中配置 GitHub
5. 输入 Client ID 和 Client Secret

**Google OAuth:**

1. 访问 Google Cloud Console > APIs & Services > Credentials
2. 创建 OAuth 2.0 客户端 ID
3. 设置授权重定向 URI: `https://your-project.supabase.co/auth/v1/callback`
4. 在 Supabase Dashboard > Authentication > Providers 中配置 Google
5. 输入 Client ID 和 Client Secret

## 👤 用户角色

### 管理员 (admin)

- **权限**: 访问管理后台，管理所有内容
- **获取方式**: 第一个注册用户自动成为管理员

### 普通用户 (user)

- **权限**: 登录后可发表评论（需要实现评论功能）
- **默认角色**: 所有新注册用户默认为普通用户

## 🛡️ 路由保护

### 自动保护的路由

- `/admin/*` - 需要管理员权限
- 使用 `AuthGuard` 组件的任何页面

## 🎣 Hooks 使用

### useAuth - 完整认证状态

```tsx
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, isAdmin, isLoading, signIn, signOut } = useAuth();

  if (isLoading) return <div>加载中...</div>;

  return (
    <div>
      {user ? (
        <div>
          <p>欢迎，{user.profile?.display_name}</p>
          {isAdmin && <p>您是管理员</p>}
          <button onClick={signOut}>登出</button>
        </div>
      ) : (
        <button onClick={() => signIn("github")}>GitHub登录</button>
      )}
    </div>
  );
}
```

## 📱 用户界面

### 登录流程

1. 用户点击"登录"按钮
2. 跳转到 `/auth/login` 页面
3. 选择 GitHub 或 Google 登录
4. OAuth 重定向到 `/auth/callback`
5. 处理回调并重定向到原页面

### 用户菜单

- **桌面端**: 右上角头像下拉菜单
- **移动端**: 汉堡菜单中的用户区域
- **功能**: 显示用户信息、管理员标识、登出

## 🔒 安全特性

### 行级安全 (RLS)

- 文章：只有管理员可以查看草稿
- 评论：用户只能查看已审核的评论
- 用户配置：用户只能查看/编辑自己的配置

### 权限检查

- **客户端**: AuthGuard 组件和 Hooks
- **服务端**: API 路由权限验证（待实现）
- **数据库**: RLS 策略强制执行
