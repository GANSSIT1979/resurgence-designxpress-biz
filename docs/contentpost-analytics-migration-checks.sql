-- CONTENTPOST ANALYTICS MIGRATION CHECKS
-- Run these against Preview first, then Production.

-- 1) Confirm the direct analytics columns exist on ContentPost.
SELECT
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'ContentPost'
  AND column_name IN (
    'viewCount',
    'uniqueViewCount',
    'watchTimeSeconds',
    'completedViewCount',
    'avgWatchTimeSeconds',
    'completionRate',
    'firstViewedAt',
    'lastViewedAt',
    'lastAnalyticsRollupAt'
  )
ORDER BY column_name;

-- 2) Confirm the analytics tables exist.
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'ContentPostAnalyticsDay',
    'CreatorAnalyticsDay',
    'ContentPostViewSession'
  )
ORDER BY table_name;

-- 3) Confirm expected analytics indexes exist.
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'ContentPost',
    'ContentPostAnalyticsDay',
    'CreatorAnalyticsDay',
    'ContentPostViewSession'
  )
ORDER BY tablename, indexname;

-- 4) Confirm daily rollup uniqueness constraints exist.
SELECT conname, pg_get_constraintdef(c.oid)
FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname IN ('ContentPostAnalyticsDay', 'CreatorAnalyticsDay')
  AND c.contype = 'u'
ORDER BY t.relname, conname;

-- 5) Confirm direct analytics values can be queried safely.
SELECT
  id,
  "viewCount",
  "uniqueViewCount",
  "watchTimeSeconds",
  "completedViewCount",
  "lastViewedAt"
FROM "ContentPost"
ORDER BY "lastViewedAt" DESC NULLS LAST
LIMIT 20;

-- 6) Confirm the session table exposes repo-native ownership fields.
SELECT
  id,
  "contentPostId",
  "creatorProfileId",
  "authorUserId",
  "viewerUserId",
  "viewerSessionKey",
  "watchTimeSeconds",
  "completedViewCount",
  "lastViewedAt"
FROM "ContentPostViewSession"
ORDER BY "lastViewedAt" DESC NULLS LAST
LIMIT 20;

-- 7) Sanity check for impossible negative analytics totals.
SELECT COUNT(*) AS invalid_negative_rows
FROM "ContentPost"
WHERE "viewCount" < 0
   OR "uniqueViewCount" < 0
   OR "watchTimeSeconds" < 0
   OR "completedViewCount" < 0;

-- 8) Compare session totals vs aggregate post totals.
SELECT
  cps."contentPostId",
  SUM(cps."viewCount") AS session_views,
  SUM(cps."watchTimeSeconds") AS session_watch_time,
  SUM(cps."completedViewCount") AS session_completed_views,
  cp."viewCount" AS post_views,
  cp."watchTimeSeconds" AS post_watch_time,
  cp."completedViewCount" AS post_completed_views
FROM "ContentPostViewSession" cps
JOIN "ContentPost" cp ON cp.id = cps."contentPostId"
GROUP BY cps."contentPostId", cp."viewCount", cp."watchTimeSeconds", cp."completedViewCount"
ORDER BY session_views DESC
LIMIT 20;

-- 9) Daily rollup spot check.
-- These tables may remain empty until the rollup writer or backfill job is enabled.
SELECT
  "contentPostId",
  date,
  "viewCount",
  "uniqueViewCount",
  "watchTimeSeconds",
  "completedViewCount"
FROM "ContentPostAnalyticsDay"
ORDER BY date DESC, "viewCount" DESC
LIMIT 30;

SELECT
  "creatorProfileId",
  date,
  "viewCount",
  "uniqueViewCount",
  "watchTimeSeconds",
  "completedViewCount"
FROM "CreatorAnalyticsDay"
ORDER BY date DESC, "viewCount" DESC
LIMIT 30;
