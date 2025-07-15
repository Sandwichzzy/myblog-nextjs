-- ============================================================================
-- RPC Functions for Blog System
-- ============================================================================
-- 这个文件包含了博客系统需要的 PostgreSQL RPC 函数

-- ============================================================================
-- 获取标签及其文章计数
-- ============================================================================
-- 这个函数返回所有标签以及每个标签关联的文章数量
-- 返回格式：{ id, name, color, count }
-- ============================================================================

CREATE OR REPLACE FUNCTION get_tags_with_article_count()
RETURNS TABLE (
  id UUID,
  name VARCHAR(100),
  color VARCHAR(7),
  count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.color,
    COALESCE(article_counts.count, 0) as count
  FROM tags t
  LEFT JOIN (
    SELECT 
      at.tag_id,
      COUNT(DISTINCT at.article_id) as count
    FROM article_tags at
    INNER JOIN articles a ON at.article_id = a.id
    WHERE a.published = true  -- 只计算已发布的文章
    GROUP BY at.tag_id
  ) article_counts ON t.id = article_counts.tag_id
  ORDER BY count DESC, t.name ASC;
END;
$$;

-- ============================================================================
-- 设置函数权限
-- ============================================================================
-- 允许认证用户调用此函数

GRANT EXECUTE ON FUNCTION get_tags_with_article_count() TO authenticated;
GRANT EXECUTE ON FUNCTION get_tags_with_article_count() TO anon;

-- ============================================================================
-- 函数说明注释
-- ============================================================================

COMMENT ON FUNCTION get_tags_with_article_count() IS 
'获取所有标签及其关联的已发布文章数量，按文章数量降序排列'; 