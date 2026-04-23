# Phase 1 Route Integration Plan

Updated: 2026-04-23

## Purpose

This document maps the Phase 1 TikTok-style component layer into the actual RESURGENCE route files, components, and data loaders already active in this repository.

It is written for the existing `Next.js 15` App Router + Prisma architecture. It is not a greenfield build plan.

## Source Inputs

This plan is grounded in:

- the live route structure in `src/app`
- the current feed, auth, member, creator, and commerce implementation
- the uploaded Phase 1 starter pack `resurgence-phase1-components.zip`

## Integration Rule

The uploaded starter pack is a useful reference, but it should not be copied into this app wholesale.

Reason:

- the starter pack assumes Tailwind-first component styling
- this repo already uses its own shared CSS layer in `src/app/globals.css`
- several equivalent Phase 1 primitives already exist in the repo or were implemented directly in the current upgrade pass

Use the zip as a pattern library. Wire the ideas into the current route and component system instead of replacing it.

## Starter Pack To Repo Mapping

Map the uploaded Phase 1 components like this:

- `MobileBottomNav.tsx`
  - live repo target: `src/components/mobile-bottom-nav.tsx`
  - status: already implemented and mounted from `src/app/layout.tsx`

- `KPIStatCard.tsx`
  - live repo target: `src/components/kpi-stat-card.tsx`
  - status: implemented

- `ProfileCompletionMeter.tsx`
  - live repo target: `src/components/profile-completion-meter.tsx`
  - status: implemented

- `EmptyStatePanel.tsx`
  - live repo target: `src/components/empty-state-panel.tsx`
  - status: existing repo component already available

- `AuthCard.tsx`, `SocialLoginButtons.tsx`, `OTPEntryFields.tsx`
  - live repo target: `src/app/login/page.tsx`
  - status: behavior implemented, extraction into standalone UI primitives is still optional

- `FeedViewport.tsx`, `CreatorActionRail.tsx`, `CreatorMetaOverlay.tsx`, `ProductTagPill.tsx`
  - live repo target: `src/components/feed/creator-commerce-feed.tsx`
  - status: behavior already implemented inside the current feed shell; future extraction is optional cleanup work

- `AppShell.tsx`
  - live repo target:
    - `src/components/site-header.tsx`
    - `src/components/mobile-bottom-nav.tsx`
    - `src/components/role-shell.tsx`
  - status: already split into public shell and role dashboard shell patterns

- `CloudflareStreamEmbed.tsx`
  - live repo target: future enhancement only
  - status: not integrated yet because current media flow already supports native video plus external YouTube/Vimeo embeds

## Route-By-Route Integration

## 1. `/login`

### Active Route File

- `src/app/login/page.tsx`

### Current Integration

This route already includes the major Phase 1 behavior:

- mode switch between login and signup
- password login
- Google sign-in/signup
- mobile OTP signup
- mobile OTP login
- role selection
- referral code capture
- onboarding interest chips
- profile completion prompt
- welcome state after successful signup

### Backing API Routes

- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/google/route.ts`
- `src/app/api/auth/mobile/request-otp/route.ts`
- `src/app/api/auth/mobile/verify-otp/route.ts`
- `src/app/api/auth/mobile/login/request-otp/route.ts`
- `src/app/api/auth/mobile/login/verify-otp/route.ts`

### Recommended Next Cleanup

- extract the current auth provider panels into optional shared components if the login page grows further
- keep behavior in place; treat extraction as refactor-only work

## 2. `/`

### Active Route File

- `src/app/page.tsx`

### Current Integration

Homepage Phase 1 already routes through:

- `src/components/feed/creator-commerce-feed.tsx`
- `src/components/vertical-media-feed.tsx`

Current homepage behavior already covers:

- feed-first brand entrance
- creator and merch stats
- trending topic links
- creator directory CTA
- shop spotlight
- sponsor and partner sections

### Data Loaders

- `getHomeData()`
- `getProductServices()`
- `getPublicSettings()`
- `getFeaturedShopProducts()`
- `getPublicFeed()`

### Recommended Next Cleanup

- if the feed shell gets more complex, split `creator-commerce-feed.tsx` into smaller internal components instead of rewriting the route

## 3. `/feed`

### Active Route File

- `src/app/feed/page.tsx`

### Current Integration

`/feed` already uses the flagship Phase 1 experience through:

- `src/components/feed/creator-commerce-feed.tsx`

Current behavior already includes:

- vertical feed cards
- discovery clusters
- creator rails
- merch highlights
- sponsor moments
- like, comment, save, follow, and share actions
- cursor loading
- fallback behavior when feed data is limited

### Data Layer

- `src/lib/feed/queries.ts`
- `src/lib/feed/serializers.ts`
- `src/lib/feed/types.ts`

### API Dependencies

- `/api/feed`
- `/api/feed/[postId]`
- `/api/feed/[postId]/comments`
- `/api/feed/[postId]/like`
- `/api/feed/[postId]/save`
- `/api/feed/creators/[creatorId]/follow`

### Recommended Next Cleanup

- optional extraction target:
  - `FeedViewport`
  - `CreatorActionRail`
  - `CreatorMetaOverlay`
  - `ProductTagPill`

That should be a refactor pass, not a route rewrite.

## 4. `/member`

### Active Route File

- `src/app/member/page.tsx`

### Current Integration

The member dashboard already reflects the Phase 1 direction and uses:

- `src/components/role-shell.tsx`
- `src/components/notification-center.tsx`
- shared member helper logic in `src/lib/member.ts`

Current member experience already covers:

- profile completion
- account status
- notifications
- recent orders
- saved content
- uploaded posts
- creator follow summary
- suggested creators
- referral activity
- engagement streaks
- merch recommendations

### Data Layer

The route is server-rendered and already aggregates:

- orders
- follows
- saves
- creator profile linkage
- notifications
- featured products
- public feed highlights
- referral signups

### Recommended Next Cleanup

- move repeated dashboard card markup into more shared presentation components only if multiple role dashboards begin to reuse the same layout blocks

## 5. `/creators/[slug]`

### Active Route File

- `src/app/creators/[slug]/page.tsx`

### Current Integration

The creator profile route already feels like a channel surface and uses:

- `src/components/creator/creator-profile-dashboard.tsx`
- `src/components/creator-analytics-panel.tsx`
- `src/components/event-media-carousel.tsx`
- `src/components/shop/product-card.tsx`

Current creator profile behavior already covers:

- creator profile header and narrative
- analytics summary
- recent published channel posts
- tagged merch
- event-based gallery media
- partner/contact CTAs

### Data Layer

- `getCreatorBySlug()`
- direct `prisma.contentPost.findMany(...)`
- direct `prisma.shopProduct.findMany(...)`

### Recommended Next Cleanup

- if tabs are introduced later, keep the current route and page loader; add a client tab layer inside the existing page instead of splitting into many new routes

## Adjacent Phase 1 Surfaces Already Upgraded

These are not part of the core route list above, but the current codebase already carries Phase 1-aligned work here too:

- `/creator/dashboard`
  - `src/app/creator/dashboard/page.tsx`
  - `src/components/creator/creator-dashboard-overview.tsx`

- `/creator/posts`
  - `src/app/creator/posts/page.tsx`
  - `src/components/creator/creator-post-manager.tsx`

- `/shop/product/[slug]`
  - `src/app/shop/product/[slug]/page.tsx`
  - creator-linked content rail already added

- `/cart`
  - `src/components/shop/cart-client.tsx`
  - mobile-first summary and sticky action bar already added

## Shared UI Primitives To Reuse

Use these current repo components as the shared Phase 1 layer:

- `src/components/mobile-bottom-nav.tsx`
- `src/components/filter-chip-row.tsx`
- `src/components/profile-completion-meter.tsx`
- `src/components/kpi-stat-card.tsx`
- `src/components/sticky-mobile-action-bar.tsx`
- `src/components/notification-center.tsx`
- `src/components/empty-state-panel.tsx`

These are safer reuse targets for this repo than copying the uploaded starter pack components directly.

## Styling System Rule

Keep the Phase 1 rollout inside the current styling system:

- shared visual rules live in `src/app/globals.css`
- route behavior lives under `src/app`
- new interactive client components stay under `src/components`

Do not introduce a second parallel Tailwind-only styling system for these same surfaces unless the app explicitly commits to that migration later.

## Server And Client Boundary Rule

Keep these boundaries stable:

- route pages stay server components by default
- Prisma and data aggregation stay in server route files or server helpers
- interactivity such as OTP entry, feed actions, bottom navigation, and post studio filters stay in client components

## Deployment Order For Phase 1

Apply or validate the current Phase 1 route work in this order:

1. shared shell and bottom navigation
2. `/login`
3. `/`
4. `/feed`
5. `/member`
6. `/creators/[slug]`

Validate each step in Preview before promoting to Production.

## Route Validation Checklist

For every Phase 1 route release, verify:

- route renders on mobile
- route renders on desktop
- loading and empty states still behave correctly
- auth or role rules remain intact
- media does not crash when absent
- merch deep links still resolve
- no new Prisma drift errors appear

## Recommendation

Use the uploaded starter pack as reference-only scaffolding.

For this codebase, the safest approach is:

- keep the current route files
- keep the current Prisma-backed loaders
- keep the current CSS system
- continue extracting only the pieces that clearly improve reuse without changing route contracts
