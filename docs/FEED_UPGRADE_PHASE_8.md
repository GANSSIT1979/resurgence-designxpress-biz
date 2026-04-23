# Feed Upgrade Phase 8: Sponsor Placements

Updated: 2026-04-24

## Status

Historical phase note. Use [README.md](./README.md), [ROADMAP.md](./ROADMAP.md), [DEPLOYMENT.md](./DEPLOYMENT.md), and the rollout checklists in this folder for the current system state.

## Objective

Add sponsor-facing feed placement requests so sponsors can plan promoted creator-commerce visibility without changing the existing sponsor application, deliverable, billing, profile, shop, or public feed workflows.

## Files Created Or Updated

- `src/app/sponsor/placements/page.tsx`
- `src/app/api/sponsor/placements/route.ts`
- `src/app/api/sponsor/placements/[id]/route.ts`
- `src/components/sponsor/sponsor-placement-manager.tsx`
- `src/lib/sponsor-placements.ts`
- `src/lib/sponsor.ts`
- `src/lib/permissions.ts`
- `src/lib/resurgence.ts`
- `src/lib/validation.ts`
- `src/app/sponsor/dashboard/layout.tsx`
- `src/app/globals.css`
- `docs/README.md`
- `docs/FEED_UPGRADE_PHASE_8.md`

## Prisma Changes

No new Prisma schema changes are included in this phase.

This phase reuses the `SponsoredPlacement` model from the additive feed schema PR. Placements can link to:

- `Sponsor`
- `SponsorProfile`
- `ContentPost`
- `ShopProduct`

## Implementation Notes

- Adds `/sponsor/placements` as a protected sponsor dashboard route.
- Adds `sponsor.placements.manage` to the permission matrix.
- Adds `Feed Placements` to sponsor navigation.
- Adds sponsor-owned API routes for listing, creating, updating, and cancelling placement requests.
- Sponsors can create draft requests or submit pending requests for admin review.
- Sponsors cannot directly approve or activate placements.
- Placement requests can include schedule dates, CTA labels, CTA URLs, budgets, impression goals, a public feed post, and an official merch product.
- The public feed already only renders approved or active placements, so pending sponsor requests do not go live automatically.

## Sponsor Features

- Create feed placement requests.
- Save draft placement ideas.
- Submit requests for review.
- Attach a published public feed post.
- Attach active Official Resurgence Merch.
- Add a campaign CTA.
- Define budget and impression goals.
- See request status, schedule, impression count, and click count fields.
- Cancel own placement requests without deleting database history.

## Risk Checks

- Existing sponsor applications remain unchanged.
- Existing sponsor deliverables remain unchanged.
- Existing sponsor billing remains unchanged.
- Existing sponsor profile remains unchanged.
- Existing public feed remains unchanged for pending requests.
- No destructive migration is introduced.
- Approval, rejection, active scheduling, and moderation controls are intentionally left to the next admin moderation PR.

## Done Criteria

- Sponsors can open `/sponsor/placements`.
- Sponsors can create draft and pending placement requests.
- Sponsors can update editable placement requests.
- Sponsors can cancel own placement requests.
- Pending requests do not appear as promoted placements in the public feed.
- Build passes.
- The change can be reverted independently from admin moderation and tracking chunks.
