# API 缓存优化指南

## 📋 **概述**

本项目实现了智能缓存策略，根据环境和内容类型自动调整缓存时间，提升开发体验和生产性能。

## 🎯 **核心优化**

### **环境区分**

- **开发环境**：所有 API 不设置缓存，便于实时调试
- **生产环境**：根据内容类型设置合适的缓存时间

### **缓存策略分类**

| 策略类型      | 适用场景   | 开发环境 | 生产环境    | 示例       |
| ------------- | ---------- | -------- | ----------- | ---------- |
| `STATIC`      | 静态内容   | 不缓存   | 10 分钟缓存 | 文章详情页 |
| `SEMI_STATIC` | 半静态内容 | 不缓存   | 2 分钟缓存  | 标签列表   |
| `DYNAMIC`     | 动态内容   | 不缓存   | 1 分钟缓存  | 评论列表   |
| `FREQUENT`    | 频繁变化   | 不缓存   | 30 秒缓存   | 文章列表   |
| `RARE_CHANGE` | 极少变化   | 不缓存   | 1 小时缓存  | 配置数据   |

## 📊 **当前 API 缓存配置**

### **文章相关 API**

#### `/api/articles/[slug]` - 文章详情

- **策略**: `STATIC`
- **原因**: 文章内容相对稳定，适合较长缓存
- **配置**:
  - 开发环境：不缓存
  - 生产环境：10 分钟缓存，30 分钟 stale-while-revalidate

#### `/api/articles` - 文章列表

- **策略**: `FREQUENT`
- **原因**: 文章列表可能频繁更新（新文章发布）
- **配置**:
  - 开发环境：不缓存
  - 生产环境：30 秒缓存，90 秒 stale-while-revalidate

### **评论相关 API**

#### `/api/comments` - 评论列表

- **策略**: `DYNAMIC`
- **原因**: 评论是动态内容，需要相对及时的更新
- **配置**:
  - 开发环境：不缓存
  - 生产环境：1 分钟缓存，3 分钟 stale-while-revalidate

### **标签相关 API**

#### `/api/tags` - 标签列表

- **策略**: `SEMI_STATIC`
- **原因**: 标签相对稳定，但管理员可能会修改
- **配置**:
  - 开发环境：不缓存
  - 生产环境：2 分钟缓存，5 分钟 stale-while-revalidate

## 🔧 **使用方法**

### **基本用法**

```typescript
import { withSmartCache, CacheStrategies } from "@/lib/api-utils";

// 使用预定义策略
return withSmartCache(response, CacheStrategies.STATIC);
```

### **自定义配置**

```typescript
// 自定义缓存时间
const customConfig = {
  dev: { maxAge: 10, staleWhileRevalidate: 30 }, // 开发环境也缓存10秒
  prod: { maxAge: 900, staleWhileRevalidate: 1800 }, // 生产环境15分钟缓存
};

return withSmartCache(response, CacheStrategies.STATIC, customConfig);
```

### **兼容性**

```typescript
// 原有的 withCache 函数仍然可用，但已自动支持开发环境不缓存
return withCache(response, 300, 600);
```

## 🚀 **性能优势**

### **开发环境**

- ✅ 实时数据更新，无缓存干扰
- ✅ 快速调试和测试
- ✅ 代码修改立即生效

### **生产环境**

- ✅ 减少数据库查询压力
- ✅ 提升页面加载速度
- ✅ 降低服务器负载
- ✅ 改善用户体验

## 📈 **缓存效果监控**

### **响应头标识**

- `X-Cache-Strategy: dev-no-cache` - 开发环境不缓存
- `X-Cache-Strategy: prod-cached` - 生产环境已缓存

### **调试方法**

```bash
# 检查 API 缓存策略
curl -I http://localhost:3000/api/articles

# 生产环境检查
curl -I https://your-domain.com/api/articles
```

## 🎛️ **配置调优建议**

### **高流量场景**

- 适当延长缓存时间
- 增加 stale-while-revalidate 时间
- 考虑使用 CDN 缓存

### **实时性要求高**

- 缩短缓存时间
- 使用 `FREQUENT` 或 `DYNAMIC` 策略
- 考虑实现缓存失效机制

### **内容更新频率低**

- 使用 `STATIC` 或 `RARE_CHANGE` 策略
- 延长缓存时间到小时级别
- 配合版本控制实现缓存更新

## 🔍 **故障排查**

### **开发环境缓存问题**

1. 检查 `NODE_ENV` 环境变量
2. 确认使用了 `withSmartCache` 或更新后的 `withCache`
3. 查看响应头中的 `X-Cache-Strategy`

### **生产环境缓存过期**

1. 检查缓存策略是否合适
2. 考虑实现主动缓存失效
3. 监控缓存命中率和性能指标

## 📝 **更新日志**

- **优化前**: 所有环境使用相同缓存策略，开发调试困难
- **优化后**: 开发环境不缓存，生产环境智能缓存，提升开发体验
