-- Preview / Production verification queries for ContentPost comments.
-- This repo uses the existing "PostComment" table, not a duplicate "ContentPostComment" table.

-- 1. Confirm new comment-related ContentPost columns exist.
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'ContentPost'
  AND column_name IN ('commentCount', 'lastCommentedAt');

-- 2. Confirm new PostComment columns exist.
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'PostComment'
  AND column_name IN (
    'status',
    'visibility',
    'bodyPlain',
    'isPinned',
    'isEdited',
    'likeCount',
    'replyCount',
    'sortOrder',
    'moderationReason',
    'moderationNotes',
    'moderatedById',
    'moderatedAt',
    'editedAt',
    'deletedAt',
    'publishedAt'
  )
ORDER BY ordinal_position;

-- 3. Confirm expected indexes were created.
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('ContentPost', 'PostComment')
ORDER BY tablename, indexname;

-- 4. Check comment volume by status.
SELECT status, COUNT(*) AS total
FROM "PostComment"
GROUP BY status
ORDER BY total DESC;

-- 5. Find posts where stored commentCount does not match active visible row count.
SELECT
  p.id,
  p."commentCount" AS stored_comment_count,
  COUNT(c.id) FILTER (
    WHERE c."deletedAt" IS NULL
      AND c.status = 'ACTIVE'
  ) AS active_comment_rows
FROM "ContentPost" p
LEFT JOIN "PostComment" c ON c."postId" = p.id
GROUP BY p.id, p."commentCount"
HAVING p."commentCount" <> COUNT(c.id) FILTER (
  WHERE c."deletedAt" IS NULL
    AND c.status = 'ACTIVE'
);

-- 6. Find replies whose parent is missing from the table entirely.
SELECT c.id, c."parentCommentId", c."postId"
FROM "PostComment" c
LEFT JOIN "PostComment" parent ON parent.id = c."parentCommentId"
WHERE c."parentCommentId" IS NOT NULL
  AND parent.id IS NULL;

-- 7. Find posts whose lastCommentedAt does not match the newest active visible comment timestamp.
SELECT
  p.id,
  p."lastCommentedAt",
  MAX(c."createdAt") FILTER (
    WHERE c."deletedAt" IS NULL
      AND c.status = 'ACTIVE'
  ) AS actual_last_commented_at
FROM "ContentPost" p
LEFT JOIN "PostComment" c ON c."postId" = p.id
GROUP BY p.id, p."lastCommentedAt"
HAVING p."lastCommentedAt" IS DISTINCT FROM MAX(c."createdAt") FILTER (
  WHERE c."deletedAt" IS NULL
    AND c.status = 'ACTIVE'
);
