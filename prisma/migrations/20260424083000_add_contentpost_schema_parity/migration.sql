-- Corrective additive migration for feed, comment, and analytics schema parity.
-- This closes the gap between the checked-in Prisma schema and the earlier
-- creator-commerce migration that stopped short of the current runtime contract.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ContentPostCommentStatus') THEN
    CREATE TYPE "ContentPostCommentStatus" AS ENUM ('ACTIVE', 'HIDDEN', 'REMOVED', 'PENDING_REVIEW', 'SPAM');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ContentPostCommentVisibility') THEN
    CREATE TYPE "ContentPostCommentVisibility" AS ENUM ('PUBLIC', 'FOLLOWERS_ONLY', 'PRIVATE');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ContentViewSource') THEN
    CREATE TYPE "ContentViewSource" AS ENUM ('FEED', 'PROFILE', 'PRODUCT', 'DIRECT_LINK', 'EMBED', 'UNKNOWN');
  END IF;
END $$;

ALTER TABLE "ContentPost"
  ADD COLUMN IF NOT EXISTS "title" TEXT,
  ADD COLUMN IF NOT EXISTS "slug" TEXT,
  ADD COLUMN IF NOT EXISTS "lastCommentedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "uniqueViewCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "watchTimeSeconds" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "completedViewCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "avgWatchTimeSeconds" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "completionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "firstViewedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "lastViewedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "lastAnalyticsRollupAt" TIMESTAMP(3);

ALTER TABLE "MediaAsset"
  ADD COLUMN IF NOT EXISTS "originalFileName" TEXT;

ALTER TABLE "PostComment"
  ADD COLUMN IF NOT EXISTS "bodyPlain" TEXT,
  ADD COLUMN IF NOT EXISTS "status" "ContentPostCommentStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS "visibility" "ContentPostCommentVisibility" NOT NULL DEFAULT 'PUBLIC',
  ADD COLUMN IF NOT EXISTS "isPinned" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "isEdited" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "likeCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "replyCount" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "moderationReason" TEXT,
  ADD COLUMN IF NOT EXISTS "moderationNotes" TEXT,
  ADD COLUMN IF NOT EXISTS "moderatedById" TEXT,
  ADD COLUMN IF NOT EXISTS "moderatedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "editedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "hashtags" JSONB,
  ADD COLUMN IF NOT EXISTS "mentions" JSONB,
  ADD COLUMN IF NOT EXISTS "metadataJson" JSONB;

UPDATE "PostComment"
SET "bodyPlain" = "body"
WHERE "bodyPlain" IS NULL;

UPDATE "PostComment"
SET "publishedAt" = COALESCE("publishedAt", "createdAt")
WHERE "publishedAt" IS NULL;

WITH "reply_rollup" AS (
  SELECT "parentCommentId" AS "commentId", COUNT(*)::INTEGER AS "replyCount"
  FROM "PostComment"
  WHERE "parentCommentId" IS NOT NULL
    AND "deletedAt" IS NULL
  GROUP BY "parentCommentId"
)
UPDATE "PostComment" AS "comment"
SET "replyCount" = "reply_rollup"."replyCount"
FROM "reply_rollup"
WHERE "comment"."id" = "reply_rollup"."commentId";

WITH "comment_rollup" AS (
  SELECT
    "postId",
    COUNT(*) FILTER (
      WHERE "deletedAt" IS NULL
        AND "status" = 'ACTIVE'
    )::INTEGER AS "commentCount",
    MAX("createdAt") FILTER (
      WHERE "deletedAt" IS NULL
        AND "status" = 'ACTIVE'
    ) AS "lastCommentedAt"
  FROM "PostComment"
  GROUP BY "postId"
)
UPDATE "ContentPost" AS "post"
SET
  "commentCount" = "comment_rollup"."commentCount",
  "lastCommentedAt" = "comment_rollup"."lastCommentedAt"
FROM "comment_rollup"
WHERE "post"."id" = "comment_rollup"."postId";

CREATE TABLE IF NOT EXISTS "ContentPostAnalyticsDay" (
  "id" TEXT NOT NULL,
  "contentPostId" TEXT NOT NULL,
  "creatorProfileId" TEXT,
  "authorUserId" TEXT,
  "date" TIMESTAMP(3) NOT NULL,
  "viewCount" INTEGER NOT NULL DEFAULT 0,
  "uniqueViewCount" INTEGER NOT NULL DEFAULT 0,
  "watchTimeSeconds" INTEGER NOT NULL DEFAULT 0,
  "completedViewCount" INTEGER NOT NULL DEFAULT 0,
  "avgWatchTimeSeconds" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "completionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "shareCount" INTEGER NOT NULL DEFAULT 0,
  "likeCount" INTEGER NOT NULL DEFAULT 0,
  "saveCount" INTEGER NOT NULL DEFAULT 0,
  "commentCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ContentPostAnalyticsDay_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CreatorAnalyticsDay" (
  "id" TEXT NOT NULL,
  "creatorProfileId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "postCount" INTEGER NOT NULL DEFAULT 0,
  "publishedPostCount" INTEGER NOT NULL DEFAULT 0,
  "viewCount" INTEGER NOT NULL DEFAULT 0,
  "uniqueViewCount" INTEGER NOT NULL DEFAULT 0,
  "watchTimeSeconds" INTEGER NOT NULL DEFAULT 0,
  "completedViewCount" INTEGER NOT NULL DEFAULT 0,
  "avgWatchTimeSeconds" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "completionRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "shareCount" INTEGER NOT NULL DEFAULT 0,
  "likeCount" INTEGER NOT NULL DEFAULT 0,
  "saveCount" INTEGER NOT NULL DEFAULT 0,
  "commentCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "CreatorAnalyticsDay_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ContentPostViewSession" (
  "id" TEXT NOT NULL,
  "contentPostId" TEXT NOT NULL,
  "creatorProfileId" TEXT,
  "authorUserId" TEXT,
  "viewerUserId" TEXT,
  "viewerSessionKey" TEXT,
  "deviceHash" TEXT,
  "source" "ContentViewSource" NOT NULL DEFAULT 'FEED',
  "countryCode" TEXT,
  "locale" TEXT,
  "firstViewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastViewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "watchTimeSeconds" INTEGER NOT NULL DEFAULT 0,
  "viewCount" INTEGER NOT NULL DEFAULT 1,
  "completedViewCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ContentPostViewSession_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "ContentPost_slug_key" ON "ContentPost"("slug");
CREATE INDEX IF NOT EXISTS "ContentPost_commentCount_idx" ON "ContentPost"("commentCount");
CREATE INDEX IF NOT EXISTS "ContentPost_lastCommentedAt_idx" ON "ContentPost"("lastCommentedAt");
CREATE INDEX IF NOT EXISTS "ContentPost_lastViewedAt_idx" ON "ContentPost"("lastViewedAt");
CREATE INDEX IF NOT EXISTS "ContentPost_viewCount_idx" ON "ContentPost"("viewCount");
CREATE INDEX IF NOT EXISTS "ContentPost_uniqueViewCount_idx" ON "ContentPost"("uniqueViewCount");
CREATE INDEX IF NOT EXISTS "ContentPost_completedViewCount_idx" ON "ContentPost"("completedViewCount");

CREATE INDEX IF NOT EXISTS "MediaAsset_storageKey_idx" ON "MediaAsset"("storageKey");
CREATE INDEX IF NOT EXISTS "MediaAsset_storageProvider_storageKey_idx" ON "MediaAsset"("storageProvider", "storageKey");

CREATE INDEX IF NOT EXISTS "PostComment_postId_status_createdAt_idx" ON "PostComment"("postId", "status", "createdAt");
CREATE INDEX IF NOT EXISTS "PostComment_postId_visibility_createdAt_idx" ON "PostComment"("postId", "visibility", "createdAt");
CREATE INDEX IF NOT EXISTS "PostComment_postId_parentCommentId_createdAt_idx" ON "PostComment"("postId", "parentCommentId", "createdAt");
CREATE INDEX IF NOT EXISTS "PostComment_moderatedById_idx" ON "PostComment"("moderatedById");
CREATE INDEX IF NOT EXISTS "PostComment_status_moderatedAt_idx" ON "PostComment"("status", "moderatedAt");
CREATE INDEX IF NOT EXISTS "PostComment_deletedAt_idx" ON "PostComment"("deletedAt");
CREATE INDEX IF NOT EXISTS "PostComment_isPinned_createdAt_idx" ON "PostComment"("isPinned", "createdAt");

CREATE UNIQUE INDEX IF NOT EXISTS "ContentPostAnalyticsDay_contentPostId_date_key" ON "ContentPostAnalyticsDay"("contentPostId", "date");
CREATE INDEX IF NOT EXISTS "ContentPostAnalyticsDay_creatorProfileId_date_idx" ON "ContentPostAnalyticsDay"("creatorProfileId", "date");
CREATE INDEX IF NOT EXISTS "ContentPostAnalyticsDay_authorUserId_date_idx" ON "ContentPostAnalyticsDay"("authorUserId", "date");
CREATE INDEX IF NOT EXISTS "ContentPostAnalyticsDay_date_idx" ON "ContentPostAnalyticsDay"("date");
CREATE INDEX IF NOT EXISTS "ContentPostAnalyticsDay_creatorProfileId_date_viewCount_idx" ON "ContentPostAnalyticsDay"("creatorProfileId", "date", "viewCount");

CREATE UNIQUE INDEX IF NOT EXISTS "CreatorAnalyticsDay_creatorProfileId_date_key" ON "CreatorAnalyticsDay"("creatorProfileId", "date");
CREATE INDEX IF NOT EXISTS "CreatorAnalyticsDay_date_idx" ON "CreatorAnalyticsDay"("date");
CREATE INDEX IF NOT EXISTS "CreatorAnalyticsDay_creatorProfileId_date_idx" ON "CreatorAnalyticsDay"("creatorProfileId", "date");
CREATE INDEX IF NOT EXISTS "CreatorAnalyticsDay_creatorProfileId_viewCount_idx" ON "CreatorAnalyticsDay"("creatorProfileId", "viewCount");

CREATE INDEX IF NOT EXISTS "ContentPostViewSession_contentPostId_lastViewedAt_idx" ON "ContentPostViewSession"("contentPostId", "lastViewedAt");
CREATE INDEX IF NOT EXISTS "ContentPostViewSession_creatorProfileId_lastViewedAt_idx" ON "ContentPostViewSession"("creatorProfileId", "lastViewedAt");
CREATE INDEX IF NOT EXISTS "ContentPostViewSession_authorUserId_lastViewedAt_idx" ON "ContentPostViewSession"("authorUserId", "lastViewedAt");
CREATE INDEX IF NOT EXISTS "ContentPostViewSession_viewerUserId_idx" ON "ContentPostViewSession"("viewerUserId");
CREATE INDEX IF NOT EXISTS "ContentPostViewSession_viewerSessionKey_idx" ON "ContentPostViewSession"("viewerSessionKey");
CREATE INDEX IF NOT EXISTS "ContentPostViewSession_deviceHash_idx" ON "ContentPostViewSession"("deviceHash");
CREATE INDEX IF NOT EXISTS "ContentPostViewSession_contentPostId_viewerUserId_idx" ON "ContentPostViewSession"("contentPostId", "viewerUserId");
CREATE INDEX IF NOT EXISTS "ContentPostViewSession_contentPostId_viewerSessionKey_idx" ON "ContentPostViewSession"("contentPostId", "viewerSessionKey");
CREATE INDEX IF NOT EXISTS "ContentPostViewSession_contentPostId_deviceHash_idx" ON "ContentPostViewSession"("contentPostId", "deviceHash");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PostComment_moderatedById_fkey') THEN
    ALTER TABLE "PostComment"
      ADD CONSTRAINT "PostComment_moderatedById_fkey"
      FOREIGN KEY ("moderatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ContentPostAnalyticsDay_contentPostId_fkey') THEN
    ALTER TABLE "ContentPostAnalyticsDay"
      ADD CONSTRAINT "ContentPostAnalyticsDay_contentPostId_fkey"
      FOREIGN KEY ("contentPostId") REFERENCES "ContentPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ContentPostAnalyticsDay_creatorProfileId_fkey') THEN
    ALTER TABLE "ContentPostAnalyticsDay"
      ADD CONSTRAINT "ContentPostAnalyticsDay_creatorProfileId_fkey"
      FOREIGN KEY ("creatorProfileId") REFERENCES "CreatorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ContentPostAnalyticsDay_authorUserId_fkey') THEN
    ALTER TABLE "ContentPostAnalyticsDay"
      ADD CONSTRAINT "ContentPostAnalyticsDay_authorUserId_fkey"
      FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CreatorAnalyticsDay_creatorProfileId_fkey') THEN
    ALTER TABLE "CreatorAnalyticsDay"
      ADD CONSTRAINT "CreatorAnalyticsDay_creatorProfileId_fkey"
      FOREIGN KEY ("creatorProfileId") REFERENCES "CreatorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ContentPostViewSession_contentPostId_fkey') THEN
    ALTER TABLE "ContentPostViewSession"
      ADD CONSTRAINT "ContentPostViewSession_contentPostId_fkey"
      FOREIGN KEY ("contentPostId") REFERENCES "ContentPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ContentPostViewSession_creatorProfileId_fkey') THEN
    ALTER TABLE "ContentPostViewSession"
      ADD CONSTRAINT "ContentPostViewSession_creatorProfileId_fkey"
      FOREIGN KEY ("creatorProfileId") REFERENCES "CreatorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ContentPostViewSession_viewerUserId_fkey') THEN
    ALTER TABLE "ContentPostViewSession"
      ADD CONSTRAINT "ContentPostViewSession_viewerUserId_fkey"
      FOREIGN KEY ("viewerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
