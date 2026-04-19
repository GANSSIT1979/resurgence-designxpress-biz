# Feed Upgrade Phase 11: Performance Hardening

Updated: 2026-04-19

## Objective

Harden the creator-commerce feed for production use by reducing unnecessary media work, improving recovery states, and making lightweight interactions feel responsive without changing existing data models or commerce flows.

## Files Created Or Updated

- `src/components/feed/creator-commerce-feed.tsx`
- `src/app/feed/loading.tsx`
- `src/app/feed/error.tsx`
- `src/app/globals.css`
- `docs/README.md`
- `docs/FEED_UPGRADE_PHASE_11.md`

## Prisma Changes

No Prisma schema changes are included in this phase.

This phase preserves the feed models, merch models, checkout route, sponsor placement models, and all existing role/auth behavior.

## Implementation Notes

- Adds nearby-only media loading so offscreen videos and embeds do not load until the post approaches the viewport.
- Keeps active-card autoplay behavior while pausing inactive native videos.
- Adds lazy decoding for product and feed preview images.
- Adds load-more abort safety, retry messaging, and skeleton placeholders.
- Adds optimistic like, save, and follow UI updates with rollback on API failure.
- Adds disabled and pending states for feed actions to prevent duplicate requests.
- Adds `/feed` loading and error boundaries so feed failures degrade separately from shop, auth, and sponsorship pages.

## User-Facing Behavior

- Feed cards still scroll vertically and autoplay the active media.
- Offscreen media now shows a lightweight queued preview instead of loading every embed immediately.
- Load-more failures show a retry control and a friendly notice.
- Like, save, and follow actions respond immediately, then settle to the server response.
- If the feed route errors, users see recovery actions instead of a blank page.

## Risk Checks

- No database migration.
- No feed API contract change.
- No checkout/cart/order behavior change.
- No sponsor placement behavior change.
- Optimistic UI rolls back when auth, authorization, or network requests fail.
- Route-level error handling is scoped to `/feed`.

## Done Criteria

- Offscreen videos and embeds defer loading until near the active story.
- Load more shows skeleton and retry states.
- Like, save, and follow controls have pending states and rollback on failure.
- `/feed` has loading and error recovery UI.
- Build and TypeScript checks pass.
- The change can be reverted independently from future analytics or media-storage chunks.
