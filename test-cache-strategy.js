// 测试缓存策略是否按环境正确工作
const fetch = require("node-fetch");

async function testCacheStrategy() {
  console.log("🧪 测试 API 缓存策略...\n");

  const apis = [
    { url: "http://localhost:3000/api/articles", name: "文章列表" },
    { url: "http://localhost:3000/api/tags", name: "标签列表" },
    { url: "http://localhost:3000/api/articles/stake", name: "文章详情" },
  ];

  for (const api of apis) {
    try {
      console.log(`📡 测试 ${api.name}: ${api.url}`);

      const response = await fetch(api.url);

      // 检查缓存相关的响应头
      const cacheControl = response.headers.get("cache-control");
      const cacheStrategy = response.headers.get("x-cache-strategy");

      console.log(`   状态码: ${response.status}`);
      console.log(`   Cache-Control: ${cacheControl || "未设置"}`);
      console.log(`   X-Cache-Strategy: ${cacheStrategy || "未设置"}`);

      // 判断缓存策略
      if (process.env.NODE_ENV === "development") {
        if (cacheControl && cacheControl.includes("no-cache")) {
          console.log("   ✅ 开发环境正确：不缓存");
        } else {
          console.log("   ⚠️  开发环境异常：应该不缓存");
        }
      } else {
        if (cacheControl && cacheControl.includes("max-age")) {
          console.log("   ✅ 生产环境正确：已设置缓存");
        } else {
          console.log("   ⚠️  生产环境异常：应该设置缓存");
        }
      }

      console.log("");
    } catch (error) {
      console.log(`   ❌ 请求失败: ${error.message}`);
      console.log("");
    }
  }
}

// 检查环境
console.log(`🌍 当前环境: ${process.env.NODE_ENV || "development"}\n`);

testCacheStrategy().catch(console.error);
