# Creator-Commerce Feed Upgrade: Phases 5-6

This document records the public feed MVP slice built on top of the Phase 1-4 schema foundation.

## Phase 5 - Homepage Feed UI

Objective: add a TikTok-inspired public creator-commerce feed without removing existing homepage sponsor, creator, merch, and contact sections.

Files created or updated:

- `src/components/feed/creator-commerce-feed.tsx`
- `src/app/feed/page.tsx`
- `src/app/page.tsx`
- `src/components/site-header.tsx`
- `src/app/globals.css`

Implementation notes:

- The new feed renders at the top of the homepage and also on `/feed`.
- Existing homepage sections remain below the new feed.
- The UI includes a left navigation rail, central vertical story feed, right context rail, creator identity, hashtags, sponsor strips, product chips, and a social action rail.
- Native video posts autoplay muted when visible.
- YouTube and Vimeo posts render with safe embed URLs.
- Product chips add merch to the existing `resurgence_cart` localStorage cart shape, preserving the current checkout flow.
- If the new feed tables are not migrated or have no published posts yet, the feed falls back to existing active `MediaEvent` and `GalleryMedia` records.

## Phase 6 - Feed Backend

Objective: expose route handlers for public feed reads and protected social/post actions.

Files created:

- `src/lib/feed/types.ts`
- `src/lib/feed/validation.ts`
- `src/lib/feed/authorization.ts`
- `src/lib/feed/serializers.ts`
- `src/lib/feed/queries.ts`
- `src/lib/feed/mutations.ts`
- `src/lib/feed/api.ts`
- `src/app/api/feed/route.ts`
- `src/app/api/feed/[postId]/route.ts`
- `src/app/api/feed/[postId]/like/route.ts`
- `src/app/api/feed/[postId]/comments/route.ts`
- `src/app/api/feed/[postId]/save/route.ts`
- `src/app/api/feed/[postId]/products/route.ts`
- `src/app/api/feed/creators/[creatorId]/follow/route.ts`
- `src/app/api/creators/[creatorId]/follow/route.ts`
- `src/app/api/feed/promoted/route.ts`

Route summary:

- `GET /api/feed`: public feed read, with cursor and limit support.
- `POST /api/feed`: create a feed post for creator, staff, or admin users.
- `GET /api/feed/[postId]`: read a public published post.
- `PATCH /api/feed/[postId]`: update a manageable post.
- `DELETE /api/feed/[postId]`: soft-delete a post by setting status to `DELETED`.
- `POST /api/feed/[postId]/like`: like or unlike a post.
- `GET /api/feed/[postId]/comments`: read visible top-level comments.
- `POST /api/feed/[postId]/comments`: create a comment.
- `POST /api/feed/[postId]/save`: save or unsave a post.
- `POST /api/feed/[postId]/products`: replace product tags for a manageable post.
- `POST /api/feed/creators/[creatorId]/follow`: follow or unfollow a creator.
- `POST /api/creators/[creatorId]/follow`: alias for creator follow action.
- `GET /api/feed/promoted`: read approved or active promoted placements.

Authorization notes:

- Public reads only return `PUBLISHED` and `PUBLIC` posts.
- Create access is limited to `CREATOR`, `STAFF`, and `SYSTEM_ADMIN`.
- Creator users can create posts only for their linked `CreatorProfile`.
- Staff and system admin can manage any feed post.
- Owner or linked creator can manage their own post.
- Likes, comments, saves, and follows require an authenticated session.

Deferred to later PRs:

- Creator post management dashboard.
- Sponsor placement management dashboard.
- Admin moderation dashboard.
- Full upload workflow for creator post media.
- Feed analytics and impression tracking.
- Dedicated product-tag picker UI.
