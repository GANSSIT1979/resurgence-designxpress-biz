# DATABASE

Updated: 2026-04-24
For migration-first rollout of the current content-post schema, also use [PRISMA_MIGRATION_ROLLOUT_CHECKLIST.md](./PRISMA_MIGRATION_ROLLOUT_CHECKLIST.md).

For the additive comment-schema rollout on the existing comment path, also use [PRISMA_CONTENTPOST_COMMENT_SCHEMA_INTEGRATION.md](./PRISMA_CONTENTPOST_COMMENT_SCHEMA_INTEGRATION.md) and [contentpost-comment-migration-checks.sql](./contentpost-comment-migration-checks.sql).

For the additive analytics-schema rollout on the existing feed path, also use [PRISMA_CONTENTPOST_ANALYTICS_SCHEMA_INTEGRATION.md](./PRISMA_CONTENTPOST_ANALYTICS_SCHEMA_INTEGRATION.md) and [contentpost-analytics-migration-checks.sql](./contentpost-analytics-migration-checks.sql).

## Provider Strategy

- local development: SQLite
- hosted Preview and Production: PostgreSQL

## Prisma Source Of Truth

- source schema: `prisma/schema.prisma`
- generated schema for CLI work: `prisma/schema.generated.prisma`
- prep script: `scripts/prepare-prisma-schema.mjs`
- push helper: `scripts/push-prisma-schema.mjs`
- seed file: `prisma/seed.ts`

The source schema remains `prisma/schema.prisma`, but generate, push, and migrate commands operate on `schema.generated.prisma` after the provider is prepared.

Environment accuracy note:

- Prisma uses `DATABASE_URL`
- `PRISMA_DB_PROVIDER` helps the provider-switch script choose SQLite or PostgreSQL
- Supabase or Vercel helper variables such as `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, and `POSTGRES_URL_NON_POOLING` are optional operational helpers, not direct inputs to the checked-in schema

## Major Model Areas

### Identity And Access

- `User`
- `SponsorProfile`
- `StaffProfile`
- `PartnerProfile`
- `CreatorProfile`

### Public Intake And Support

- `Inquiry`
- `SponsorSubmission`
- `PlatformNotification`
- `AutomatedEmail`

### Sponsorship And Partner Operations

- `Sponsor`
- `SponsorPackageTemplate`
- `SponsorDeliverable`
- `SponsorInventoryCategory`
- `Partner`
- `PartnerCampaign`
- `PartnerReferral`
- `PartnerAgreement`

### Staff, Finance, And Reporting

- `StaffTask`
- `StaffScheduleItem`
- `StaffAnnouncement`
- `Invoice`
- `CashierTransaction`
- `Receipt`
- `AdminReport`

### Media, Feed, And Community

- `MediaEvent`
- `GalleryMedia`
- `ContentPost`
- `MediaAsset`
- `Hashtag`
- `PostHashtag`
- `PostLike`
- `PostComment`
- `PostSave`
- `PostProductTag`
- `ContentPostAnalyticsDay`
- `CreatorAnalyticsDay`
- `ContentPostViewSession`
- `SponsoredPlacement`

### Commerce

- `ShopCategory`
- `ShopProduct`
- `ShopOrder`
- `ShopOrderItem`

## Current Feed Model Reality

The active feed stack is normalized, not a flat one-table content model.

Important fields and relationships include:

- `ContentPost.title`
- `ContentPost.slug`
- `ContentPost.viewCount`
- `ContentPost.uniqueViewCount`
- `ContentPost.watchTimeSeconds`
- `ContentPost.completedViewCount`
- `ContentPost.avgWatchTimeSeconds`
- `ContentPost.completionRate`
- `ContentPost.firstViewedAt`
- `ContentPost.lastViewedAt`
- `ContentPost.lastCommentedAt`
- `ContentPost.metadataJson`
- `MediaAsset.originalFileName`
- `MediaAsset.storageProvider`
- `MediaAsset.storageKey`
- `PostComment` moderation, reply threading, and metadata fields
- `ContentPostViewSession` for lightweight session-level analytics persistence
- additive `ContentPostAnalyticsDay` and `CreatorAnalyticsDay` tables for future rollups

Important accuracy note:

- Cloudflare video identity is stored through `MediaAsset.storageProvider`, `MediaAsset.storageKey`, and media metadata
- hashtags remain normalized through `Hashtag` and `PostHashtag`
- likes, saves, comments, and follows use real relational tables
- analytics prefer direct `ContentPost` fields plus `ContentPostViewSession`, with `metadataJson.analytics` retained as a rollout bridge

## Seed Data

`prisma/seed.ts` populates development-friendly records for:

- admin, cashier, sponsor, staff, partner, and creator login flows
- creators, media events, settings, sponsors, packages, and partner records
- official merch categories and products
- platform notifications and automated email records
- dashboard-supporting operational sample data

## Local Commands

```bash
npm run prisma:generate
npm run db:push
npm run db:seed
```

## Production Guidance

- treat additive Prisma fields as rollout risks until the target PostgreSQL database is migrated
- generate and review migrations in development
- deploy migrations to Preview before trusting Preview behavior
- promote Production only after the matching database and app revision are both verified
- do not assume the daily analytics tables are populated until the rollup writer or backfill step ships
