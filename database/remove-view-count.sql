-- ============================================================================
-- 删除浏览量功能 (Remove View Count Feature)
-- ============================================================================
-- 本脚本用于从现有数据库中删除浏览量相关功能
--
-- ⚠️  执行前必读：
-- 1. 此操作不可逆，会永久删除 view_count 列的所有数据
-- 2. 请先在测试环境中验证此脚本
-- 3. 生产环境执行前请务必备份数据库：
--    pg_dump -h <host> -U <user> -d <database> -t articles > backup_articles.sql
-- 4. 建议在低峰期执行此迁移
-- 5. 执行时间取决于 articles 表的数据量，大表可能需要几秒到几分钟
-- ============================================================================

-- 开始事务，确保所有操作要么全部成功，要么全部回滚
BEGIN;

-- ============================================================================
-- 步骤 1: 验证当前数据库状态
-- ============================================================================

-- 查询 view_count 列是否存在（输出仅供参考，不影响执行）
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'articles'
      AND column_name = 'view_count'
  ) THEN
    RAISE NOTICE '✓ 检测到 articles 表中存在 view_count 列';
  ELSE
    RAISE NOTICE '✗ articles 表中不存在 view_count 列，跳过删除';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = 'increment_view_count'
  ) THEN
    RAISE NOTICE '✓ 检测到 increment_view_count 函数';
  ELSE
    RAISE NOTICE '✗ increment_view_count 函数不存在，跳过删除';
  END IF;
END $$;

-- ============================================================================
-- 步骤 2: 删除 RPC 函数
-- ============================================================================

-- 删除 increment_view_count 函数
-- 注意：必须先删除函数，因为它依赖 articles 表的 view_count 列
DROP FUNCTION IF EXISTS increment_view_count(UUID);

RAISE NOTICE '✓ 已删除 increment_view_count 函数';

-- ============================================================================
-- 步骤 3: 删除表列
-- ============================================================================

-- 从 articles 表中删除 view_count 列
-- 此操作会永久删除该列的所有数据，无法恢复
ALTER TABLE articles DROP COLUMN IF EXISTS view_count;

RAISE NOTICE '✓ 已从 articles 表中删除 view_count 列';

-- ============================================================================
-- 步骤 4: 验证删除结果
-- ============================================================================

DO $$
BEGIN
  -- 验证列是否已删除
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'articles'
      AND column_name = 'view_count'
  ) THEN
    RAISE NOTICE '✓ 验证通过：view_count 列已成功删除';
  ELSE
    RAISE EXCEPTION '✗ 删除失败：view_count 列仍然存在';
  END IF;

  -- 验证函数是否已删除
  IF NOT EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = 'increment_view_count'
  ) THEN
    RAISE NOTICE '✓ 验证通过：increment_view_count 函数已成功删除';
  ELSE
    RAISE EXCEPTION '✗ 删除失败：increment_view_count 函数仍然存在';
  END IF;

  RAISE NOTICE '========================================';
  RAISE NOTICE '✓ 浏览量功能删除完成！';
  RAISE NOTICE '========================================';
END $$;

-- 提交事务
COMMIT;

-- ============================================================================
-- 后续检查清单
-- ============================================================================
-- 数据库迁移完成后，请确认以下应用层代码已同步更新：
--
-- ✓ TypeScript 类型定义：src/types/database.ts
-- ✓ 数据库服务层：src/lib/articles.ts (删除 incrementViewCount 函数)
-- ✓ 前端展示组件：src/components/Article/ArticleCard.tsx
-- ✓ 文章详情页面：src/app/articles/[slug]/page.tsx
-- ✓ 管理后台页面：src/app/admin/articles/*.tsx
-- ✓ API 路由：src/app/api/articles/[slug]/route.ts
-- ✓ 数据库架构文档：database/schema.sql
--
-- 建议执行流程：
-- 1. 先更新应用代码并部署（避免引用已删除的列）
-- 2. 再执行此数据库迁移脚本
-- 3. 最后验证应用运行正常
-- ============================================================================

-- ============================================================================
-- 回滚方案 (如需恢复浏览量功能)
-- ============================================================================
-- 如果需要恢复浏览量功能，请执行以下 SQL：
--
-- BEGIN;
--
-- -- 1. 重新添加 view_count 列
-- ALTER TABLE articles ADD COLUMN view_count INTEGER DEFAULT 0;
--
-- -- 2. 重新创建 increment_view_count 函数
-- CREATE OR REPLACE FUNCTION increment_view_count(article_id UUID)
-- RETURNS void AS $BODY$
-- BEGIN
--   UPDATE articles
--   SET view_count = view_count + 1
--   WHERE id = article_id;
-- END;
-- $BODY$ LANGUAGE 'plpgsql' VOLATILE;
--
-- COMMIT;
--
-- 注意：回滚后 view_count 数据会从 0 重新开始计数
-- ============================================================================
