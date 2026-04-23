# Feed Upgrade Phase 7: Creator Experience

Updated: 2026-04-24

## Status

Historical phase note. Use [README.md](./README.md), [ROADMAP.md](./ROADMAP.md), [DEPLOYMENT.md](./DEPLOYMENT.md), and the rollout checklists in this folder for the current system state.

## Objective

Add a reversible creator-facing feed studio that lets linked creator users create and manage their own TikTok-inspired creator-commerce posts without changing existing auth, admin, sponsor, or checkout workflows.

## Files Created Or Updated

- `src/app/creator/posts/page.tsx`
- `src/components/creator/creator-post-manager.tsx`
- `src/lib/creators.ts`
- `src/lib/permissions.ts`
- `src/lib/resurgence.ts`
- `src/app/globals.css`
- `docs/README.md`
- `docs/FEED_UPGRADE_PHASE_7.md`

## Prisma Changes

No new Prisma schema changes are included in this phase.

This phase depends on the additive feed schema from `FEED_UPGRADE_PHASE_1_4.md`, including:

- `ContentPost`
- `MediaAsset`
- `Hashtag`
- `PostHashtag`
- `PostLike`
- `PostComment`
- `PostSave`
- `Follow`
- `SponsoredPlacement`
- `PostProductTag`

## Implementation Notes

- Adds `/creator/posts` as a protected creator dashboard route.
- Adds `creator.posts.manage` to the permission matrix.
- Adds `Feed Posts` to the creator dashboard navigation.
- Reuses the existing `/api/feed` route handlers from Phase 5-6 for create, patch, and delete actions.
- Reuses the existing upload endpoint through `ImageUploadField` for creator image uploads.
- Reuses `ShopProduct` as the source of truth for merch product tags.
- Creator-created posts are submitted as drafts or pending review; public publishing remains controlled by the existing feed authorization logic.
- The page shows a safe migration warning if feed tables are not available yet, instead of removing or changing legacy creator dashboard behavior.

## Creator Studio Features

- Create a feed post with caption, summary, media, hashtags, and merch tags.
- Upload image media or paste external media URLs.
- Save drafts.
- Submit posts for review.
- Edit existing creator-owned posts.
- Delete creator-owned posts through the existing soft-delete feed route.
- View post counts, review counts, draft counts, and engagement totals.
- View per-post views, likes, comments, and saves.

## Risk Checks

- Existing creator dashboard route remains unchanged at `/creator/dashboard`.
- Existing public creator directory remains unchanged at `/creators`.
- Existing public feed API remains public for `GET /api/feed`.
- No destructive migration is introduced.
- No shop checkout logic is changed.
- No sponsor workflow is changed.
- Creator route access remains tied to the existing session role and permission system.

## Done Criteria

- `/creator/posts` appears in the creator sidebar.
- A linked creator can create draft or pending-review feed posts.
- A linked creator can update and delete their own posts.
- Product tags use active `ShopProduct` records.
- Missing feed tables show an actionable warning.
- Build passes.
- The change can be reverted independently from later sponsor, admin, and shop integration chunks.
