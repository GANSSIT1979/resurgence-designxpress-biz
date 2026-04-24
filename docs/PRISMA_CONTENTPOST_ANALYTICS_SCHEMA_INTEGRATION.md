# PRISMA CONTENTPOST ANALYTICS SCHEMA INTEGRATION

Updated: 2026-04-24

## Status

Historical schema-integration note. Use [DATABASE.md](./DATABASE.md), [PRISMA_MIGRATION_ROLLOUT_CHECKLIST.md](./PRISMA_MIGRATION_ROLLOUT_CHECKLIST.md), and [PREVIEW_RELEASE_SMOKE_TEST.md](./PREVIEW_RELEASE_SMOKE_TEST.md) for the current rollout source of truth.

The current corrective migration that brings the deployed PostgreSQL schema up to this analytics contract is:

```txt
prisma/migrations/20260424083000_add_contentpost_schema_parity/migration.sql
```

## Purpose

This document covers the additive analytics-schema merge for the existing RESURGENCE feed stack.

It is written for the live architecture in this repo:

- Next.js 15 App Router
- route handlers under `src/app/api`
- Prisma-backed relational persistence
- public creator-commerce feed routes on `/` and `/feed`
- creator workspace routes under `/creator/*`
- local SQLite fallback for development and hosted PostgreSQL for Preview/Production

## What This Repo Actually Merged

### Direct `ContentPost` analytics fields

The normalized `ContentPost` model now includes first-class analytics fields for:

- `viewCount`
- `uniqueViewCount`
- `watchTimeSeconds`
- `completedViewCount`
- `avgWatchTimeSeconds`
- `completionRate`
- `firstViewedAt`
- `lastViewedAt`
- `lastAnalyticsRollupAt`

Existing counters such as `likeCount`, `saveCount`, `shareCount`, and `commentCount` remain on `ContentPost`.

### Session persistence

`ContentPostViewSession` is now part of the schema for lightweight per-post session tracking.

This repo stores ownership in a repo-native way:

- `contentPostId`
- `creatorProfileId`
- `authorUserId`
- `viewerUserId`
- `viewerSessionKey`

This is more accurate for RESURGENCE than a generic `creatorId` because the app already distinguishes:

- `ContentPost.authorUserId`
- `ContentPost.creatorProfileId`

That matters when staff or admins publish content on behalf of a creator profile.

### Daily rollup tables

The schema now includes:

- `ContentPostAnalyticsDay`
- `CreatorAnalyticsDay`

These are the additive rollup surfaces for future creator dashboard charts, trending calculations, and sponsor-facing summaries.

Important accuracy note:

- the current Phase 1 runtime writes direct `ContentPost` analytics fields and `ContentPostViewSession`
- the daily rollup tables are provisioned for migration-safe rollout and future rollup/backfill work
- do not assume the daily tables are fully populated until the rollup writer or backfill job is shipped

## Runtime Alignment

The current analytics routes are:

- `POST /api/feed/[postId]/view`
- `POST /api/feed/[postId]/watchtime`

The current runtime behavior is:

1. resolve a public `ContentPost`
2. find or create a lightweight `ContentPostViewSession`
3. update direct `ContentPost` analytics fields
4. keep a compatibility sync in `metadataJson.analytics` during rollout

That compatibility sync is intentional so Preview and Production can survive one migration cycle without breaking older feed reads that still rely on post metadata.

## Merge Notes

This was merged as an additive patch, not a schema replacement.

### Ownership model adaptation

The uploaded pack used generic creator-account naming. This repo uses:

- `User`
- `CreatorProfile`
- `ContentPost.authorUserId`
- `ContentPost.creatorProfileId`

The analytics tables were adapted to that ownership model instead of duplicating generic `creatorId` fields.

### Provider compatibility

The uploaded pack used PostgreSQL-style date intent for daily buckets. This repo keeps the schema provider-switch-safe for local SQLite fallback, so the daily bucket fields use plain `DateTime` rather than PostgreSQL-only field annotations.

### Canonical source of truth

After the migration is applied, the canonical analytics fields should be:

- direct columns on `ContentPost`
- rows in `ContentPostViewSession`

`metadataJson.analytics` should be treated as a rollout bridge, not the long-term source of truth.

## Suggested Migration Strategy

1. Merge the additive schema into `prisma/schema.prisma`.
2. Run `npm run prisma:generate`.
3. Generate the migration locally and review the SQL.
4. Apply the migration to Preview PostgreSQL first.
5. Deploy the matching Preview app revision.
6. Smoke-test `/feed`, `/creator/dashboard`, view registration, and watch-time registration.
7. Apply the exact reviewed migration to Production.
8. Promote the matching app revision only after Production checks pass.

## Repo-Specific Follow-Up Work

The schema-parity migration now exists. The clean next steps after that migration are:

- ship a backfill or rollup job for `ContentPostAnalyticsDay` and `CreatorAnalyticsDay`
- update creator dashboard reporting to query rollup tables instead of only live post counters
- retire the `metadataJson.analytics` bridge once Preview and Production are fully migrated
