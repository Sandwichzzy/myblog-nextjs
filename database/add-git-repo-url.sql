-- 添加Git仓库地址字段到articles表
-- 执行日期: 2024-12-19

ALTER TABLE articles ADD COLUMN git_repo_url VARCHAR(500);

-- 添加注释
COMMENT ON COLUMN articles.git_repo_url IS '项目Git仓库地址，可选字段，用于展示项目源码链接';
