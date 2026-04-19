# Creator-Commerce Feed Upgrade: Phases 1-4

This document records the first reversible implementation slice for evolving Resurgence Powered by DesignXpress into a TikTok-inspired creator-commerce platform.

## Phase 1 - Codebase Assessment

### What already exists

- Auth is custom JWT/session-cookie based and enforced through `src/middleware.ts`.
- Role access is centralized in `src/lib/permissions.ts` and role metadata lives in `src/lib/resurgence.ts`.
- Existing roles already include `MEMBER`, `CREATOR`, `COACH`, `REFEREE`, `SPONSOR`, `PARTNER`, `STAFF`, `CASHIER`, and `SYSTEM_ADMIN`.
- Creator management already exists through `CreatorProfile`, `/creators`, `/creators/[slug]`, `/creator/dashboard`, and `/admin/creators`.
- Media/gallery support already exists through `MediaEvent`, `GalleryMedia`, `UploadAsset`, and `src/components/vertical-media-feed.tsx`.
- Shop and official merch already exist through `ShopProduct`, `ShopCategory`, `ShopOrder`, `ShopOrderItem`, cart, checkout, and admin product management.
- Sponsor workflows already exist through sponsor profiles, submissions, packages, inventory, deliverables, billing, and sponsor dashboards.
- Notification primitives already exist through `PlatformNotification` and `AutomatedEmail`.

### What should be reused

- Reuse `User` as the identity source of truth.
- Reuse `CreatorProfile` instead of creating a second creator profile table.
- Reuse `ShopProduct` as the product source of truth for shoppable feed tags.
- Reuse `Sponsor` and `SponsorProfile` for sponsor placements.
- Reuse `PlatformNotification` with optional feed references instead of creating a disconnected notification table.
- Reuse the existing upload layer and configure persistent production storage for video-heavy feed content.

## Phase 2 - Architecture Plan

The first schema slice adds a dedicated feed domain while keeping existing modules untouched:

- `ContentPost` represents a creator, admin, or sponsor-visible feed post.
- `MediaAsset` stores post media metadata and points at uploaded or external media.
- `Hashtag` and `PostHashtag` support searchable captions and topic navigation.
- `PostLike`, `PostComment`, and `PostSave` support social actions.
- `Follow` supports users following creator profiles.
- `PostProductTag` connects feed posts to official merch products.
- `SponsoredPlacement` connects feed posts, sponsors, sponsor profiles, and optional products.
- `PlatformNotification` receives optional `actorUserId`, `contentPostId`, and `kind` fields for future feed notifications.

Public routes planned for the next slice:

- `/`
- `/feed`
- `/creators/[slug]`
- `/shop/product/[slug]`

Protected routes planned for later slices:

- `/creator/posts`
- `/sponsor/dashboard/placements`
- `/admin/feed`

## Phase 3 - Prisma Schema Design

The schema changes are additive only:

- New enums: `ContentPostStatus`, `ContentPostVisibility`, `ContentPostMediaType`, `SponsoredPlacementStatus`.
- New models: `ContentPost`, `MediaAsset`, `Hashtag`, `PostHashtag`, `PostLike`, `PostComment`, `PostSave`, `Follow`, `SponsoredPlacement`, `PostProductTag`.
- Existing models extended with relation fields only: `User`, `CreatorProfile`, `Sponsor`, `SponsorProfile`, `ShopProduct`, `PlatformNotification`.

Important indexes were added for feed reads and social actions:

- Published feed reads: `ContentPost(status, visibility, publishedAt)`.
- Creator feed reads: `ContentPost(creatorProfileId, status, publishedAt)`.
- Author dashboard reads: `ContentPost(authorUserId, createdAt)`.
- Media ordering: `MediaAsset(postId, sortOrder)`.
- Idempotent social actions: unique `PostLike(postId, userId)`, `PostSave(postId, userId)`, and `Follow(followerUserId, creatorProfileId)`.
- Product tag reads: `PostProductTag(postId, sortOrder)` and `PostProductTag(productId)`.
- Sponsor placement reads: placement status and sponsor/post/product indexes.

## Phase 4 - Migration Strategy

Migration file:

```txt
prisma/migrations/20260419000000_add_creator_commerce_feed_schema/migration.sql
```

Safety characteristics:

- No existing tables are dropped.
- No existing columns are dropped.
- No existing data is deleted.
- Existing `PlatformNotification` only receives nullable columns.
- All new tables are empty on deploy and can be rolled forward independently from UI/API work.

Before production deploy:

1. Back up the production PostgreSQL database.
2. Confirm `PRISMA_DB_PROVIDER=postgresql`.
3. Run `npm run prisma:prepare`.
4. Run `npx prisma validate`.
5. Apply the migration first to a preview database.
6. Run `npx prisma migrate deploy` only after the preview migration succeeds.

## Known Risk

`prisma/schema.template.prisma` is a legacy template that does not match the active production schema. The current package scripts use `scripts/prepare-prisma-schema.mjs`, which mutates `prisma/schema.prisma` directly. Do not run the older `scripts/prepare-prisma.mjs` workflow against this branch unless the template is first reconciled with the active schema.

## Done Criteria For This Slice

- Prisma schema validates.
- Migration SQL is additive and reviewable.
- Prisma Client generates successfully.
- Next.js production build passes.
- Existing application code remains unchanged outside schema/migration documentation.
