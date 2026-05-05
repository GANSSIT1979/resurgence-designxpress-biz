# TikTok-Style Upgrade Plan

Updated: 2026-05-05

## Purpose

This plan documents the mobile-first creator-commerce direction for RESURGENCE without replacing the existing Next.js, Prisma, auth, admin, sponsor, shop, or billing architecture.

## Current Status

The upgrade is partially implemented. The current system already includes a creator-commerce feed, mobile-oriented discovery, creator pages, member dashboard improvements, shop/cart/checkout, and admin moderation. Future work should remain incremental and production-safe.

## System Constraints

Keep these intact:

- Next.js 15 App Router
- Prisma-backed PostgreSQL through Supabase in hosted environments
- route handlers under `src/app/api`
- `resurgence_admin_session` cookie auth
- role-based dashboards
- creator-commerce feed data model using `ContentPost` and `MediaAsset`
- PayPal-first sponsor/invoice billing
- manual shop payment paths
- admin moderation and CMS workflows

Do not introduce a second feed backend or a parallel media system.

## Product Goal

Create a premium, mobile-first experience where users can discover:

- creator posts
- basketball community stories
- sponsor activations
- official merch
- DAYO/event content
- creators, coaches, members, and partners

## Public Experience

### `/`

- Acts as a feed-first launchpad.
- Points users to `/feed`, `/creators`, `/shop`, sponsor pages, and support.
- Uses CMS-driven discovery cards where possible.

### `/feed`

- Remains the flagship public discovery surface.
- Uses current creator-commerce feed APIs and serializers.
- Should continue to support fallback behavior when schema or content is unavailable.

### `/creators` and `/creators/[slug]`

- Present creators as channels.
- Show profile, analytics-safe highlights, content, merch tags, and sponsor-safe media where available.

### `/shop`, `/cart`, `/checkout`

- Keep existing commerce logic.
- Align visuals with the feed-first direction.
- Keep checkout trust cues visible on mobile.

### `/login`

- Keep password, Google, and mobile OTP flows.
- Improve onboarding copy and role guidance without requiring schema changes.

## Protected Experience

### `/member`

- Personalized hub for saved content, follows, orders, notifications, referrals, recommendations, and community cues.

### `/creator/dashboard` and `/creator/posts`

- Keep ownership and moderation rules intact.
- Improve analytics cards, post management, upload flow, and content guidance incrementally.

### `/admin/feed`

- Remains the moderation and curation cockpit.
- Add filters and fast review UX without bypassing moderation rules.

## Design Direction

- Dark premium visual system.
- Rounded cards and layered panels.
- Strong mobile tap targets.
- Consistent action rails across feed cards and home discovery cards.
- Sticky mobile calls to action for cart/checkout and major workflows.
- Explicit empty and unavailable states.

## Implementation Rules

- Prefer UI/query upgrades before schema changes.
- Add one feature at a time.
- Avoid broad JSX rewrites across multiple large components in one patch.
- Preserve fallback behavior on public pages.
- Keep server components by default; use client components only where interactivity is required.
- Keep media lazy-loaded and serverless-safe.

## Future Schema Candidates

Only add these when the product behavior is validated:

- `UserProfilePreference`
- `ContentShareEvent`
- `CreatorHighlight`
- `SavedProductCollection`
- expanded notification categories
- durable onboarding preferences

The current analytics path already includes `ContentPostViewSession`, direct `ContentPost` counters, and future rollup tables.

## Acceptance Checklist

- [ ] Existing auth flows remain intact.
- [ ] `/` and `/feed` load without schema errors.
- [ ] `/member` remains stable for member accounts.
- [ ] `/creator/dashboard` and `/creator/posts` remain stable for creator accounts.
- [ ] `/shop`, `/cart`, and `/checkout` continue to create orders correctly.
- [ ] Admin moderation still controls public publishing.
- [ ] Mobile viewport behavior is checked before production promotion.
- [ ] Build and type-check pass.

## Validation Commands

```bash
npm run type-check
npm run lint
npm run build
npx prisma migrate status
```
