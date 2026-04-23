# Feed Upgrade Phase 9: Admin Moderation

Updated: 2026-04-23
## Objective

Add admin-facing moderation controls for the TikTok-inspired creator-commerce feed so the team can review creator posts and sponsor placement requests before they become public or promoted.

## Files Created Or Updated

- `src/app/admin/feed/page.tsx`
- `src/app/api/admin/feed/posts/[id]/route.ts`
- `src/app/api/admin/feed/placements/[id]/route.ts`
- `src/components/admin/feed-moderation-manager.tsx`
- `src/lib/admin-feed-moderation.ts`
- `src/components/admin-shell.tsx`
- `src/app/admin/layout.tsx`
- `src/lib/permissions.ts`
- `src/app/globals.css`
- `docs/README.md`
- `docs/FEED_UPGRADE_PHASE_9.md`

## Prisma Changes

No new Prisma schema changes are included in this phase.

This phase reuses:

- `ContentPost`
- `MediaAsset`
- `PostHashtag`
- `PostProductTag`
- `SponsoredPlacement`
- `Sponsor`
- `SponsorProfile`
- `ShopProduct`

## Implementation Notes

- Adds `/admin/feed` as a protected admin route.
- Adds `Feed Moderation` to the admin navigation.
- Adds admin-only PATCH endpoints for feed posts and sponsor placements.
- Admins can update post status, visibility, featured state, pinned state, and moderation notes.
- Admins can update placement status, CTA details, schedules, budget, impression goals, and moderation notes.
- Publishing a post sets `publishedAt` when needed.
- Archiving or deleting a post sets `archivedAt`.
- Placement notes are stored in `SponsoredPlacement.metadataJson` as moderation metadata.
- Deleted feed posts are soft-deleted by status and removed from the moderation UI list after update.

## Admin Controls

Creator feed posts:

- Draft
- Pending review
- Published
- Hidden
- Archived
- Deleted
- Public / members-only / private visibility
- Featured content
- Pinned content
- Moderation reason

Sponsor placements:

- Draft
- Pending
- Approved
- Active
- Paused
- Completed
- Cancelled
- Rejected
- CTA label and URL
- Start and end dates
- Budget amount
- Impression goal
- Admin moderation note

## Risk Checks

- Existing admin modules remain unchanged.
- Existing creator dashboard remains unchanged.
- Existing sponsor dashboard remains unchanged.
- Existing public feed remains unchanged except that approved or active placements can now be controlled by admins.
- No destructive migration is introduced.
- No checkout, payment, upload, or auth workflow is changed.
- Pending sponsor placement requests still do not go public automatically.

## Done Criteria

- Admins can open `/admin/feed`.
- Admins can publish, hide, archive, feature, pin, or soft-delete feed posts.
- Admins can approve, activate, pause, reject, cancel, or complete sponsor placements.
- Admin moderation changes save through protected admin API routes.
- Feed table migration absence shows an actionable warning.
- Build passes.
- The change can be reverted independently from later shop tracking or analytics chunks.
