# RESURGENCE TikTok-Style Upgrade Plan

Updated: 2026-04-23

## Goal

Modernize the current RESURGENCE Next.js 15 + Prisma platform into a more immersive, mobile-first creator-commerce product without replacing the stack, route surface, or role-safe workflows.

## Information Architecture

### Public experience

- `/` becomes a feed-first launchpad that points users into creator discovery, merch, sponsorship, and membership.
- `/feed` remains the flagship public experience and should continue to use the existing creator-commerce data layer.
- `/creators` and `/creators/[slug]` act as creator channels, not just profile cards.
- `/shop`, `/cart`, and `/checkout` remain intact but inherit the feed-first visual language.
- `/login` continues to handle email, mobile, Google, and OTP access with stronger onboarding guidance.

### Protected experience

- `/member` becomes a personalized hub for saved content, follows, orders, notifications, streaks, referrals, and recommended creators.
- `/creator/dashboard` and `/creator/posts` continue to own creator workflow and publishing.
- `/admin/feed` remains the moderation cockpit for featured posts, sponsor placements, and curation.

## UI/UX Plan

### Design system direction

- Keep the dark premium palette already used across the app.
- Push more rounded cards, layered glass panels, and stronger hierarchy into feed, creator, and commerce views.
- Use fixed mobile navigation for faster route hopping.
- Keep desktop navigation lighter and more curated than the legacy all-links header.

### Interaction plan

- Preserve vertical autoplay feed behavior.
- Add better discovery rails, topic chips, suggested clusters, and shoppable surfaces inside the feed.
- Keep commerce actions close to media instead of separating product discovery from content.
- Use honest unavailable states when backend support does not yet exist.

## Component Map

### Shared shell

- `src/components/site-header.tsx`
- `src/components/site-header-account-controls.tsx`
- `src/components/mobile-bottom-nav.tsx`

### Feed and discovery

- `src/components/feed/creator-commerce-feed.tsx`
- `src/components/vertical-media-feed.tsx`

### Creator experience

- `src/components/creator/creator-directory.tsx`
- `src/components/creator/creator-card.tsx`
- `src/components/creator/creator-profile-header.tsx`
- `src/components/creator/creator-profile-dashboard.tsx`

### Member experience

- `src/app/member/page.tsx`
- `src/lib/member.ts`

### Commerce

- `src/components/shop/merch-shop-client.tsx`
- `src/components/shop/product-card.tsx`
- `src/components/shop/checkout-client.tsx`

### Admin and moderation

- `src/components/admin/feed-moderation-manager.tsx`

## Route-by-Route Upgrade Plan

### `/`

- Keep homepage data loading intact.
- Use feed-first framing and social-commerce metrics above marketing sections.
- Keep creator, merch, sponsor, and contact sections as business-safe conversion paths.

### `/feed`

- Keep public feed query and cursor pagination intact.
- Add discovery launchpad, trending topic chips, creator lane rail, merch rail, share action, and suggested discovery clusters.
- Preserve fallback behavior when content-post tables are unavailable.

### `/login`

- Keep standard login, Gmail, and mobile OTP.
- Continue improving premium layout and smoother onboarding prompts.
- Avoid schema changes unless onboarding preferences are made durable.

### `/member`

- Keep server-rendered live dashboard approach.
- Add creator suggestions, streak/badge cues, and richer member guidance.
- Keep unavailable states explicit for subscriptions, wallet, rewards, and commissions until those records exist.

### `/creators`

- Present creators as channels with visible reach and platform readiness.

### `/creators/[slug]`

- Blend profile hero, analytics, channel posts, tagged merch, and gallery media into a channel-like public experience.

### `/shop`

- Keep current Prisma-backed merch listing.
- Align visuals with feed language and keep feed-to-shop movement obvious.

### `/checkout`

- Preserve the current order creation flow.
- Add trust and support cues without changing pricing or payment rules.

### `/admin/feed`

- Preserve moderation APIs.
- Add faster filtering and search so admins can curate trending and promoted surfaces more confidently.

## Prisma and Data Recommendations

The current upgrade can stay migration-safe with no required schema changes. If the next phase needs deeper TikTok-style analytics or onboarding, add these carefully:

- `UserProfilePreference`
  - interests
  - preferredTopics
  - preferredCreatorIds
  - onboardingCompletedAt
- `ContentPostView`
  - postId
  - userId or anonymous session key
  - watchedSeconds
  - completedView
- `ContentShareEvent`
  - postId
  - userId
  - channel
- `CreatorHighlight`
  - creatorProfileId
  - title
  - summary
  - mediaAssetId or externalUrl
  - sortOrder
- `SavedProductCollection`
  - userId
  - title
  - productIds relation
- notification category enum expansion for:
  - like
  - follow
  - comment
  - mention
  - order
  - sponsor
  - support

## API Notes

Current API structure under `src/app/api` should stay intact. Future additions, if needed:

- `POST /api/feed/[postId]/share`
- `POST /api/feed/[postId]/view`
- `PATCH /api/member/preferences`
- `PATCH /api/member/profile`
- `GET /api/discover`

## Migration-Safe Implementation Notes

- Prefer UI and server-query upgrades before schema changes.
- Reuse existing feed serializers, moderation routes, and Prisma queries where possible.
- Keep mobile enhancements additive rather than replacing dashboard or shop flows.
- Do not promise real-time inbox or payout features before backend support exists.

## Mobile-First Styling System

- Fixed bottom navigation for public routes
- Larger tap targets
- Near-full-screen content cards
- Sticky commerce and support CTAs
- Consistent premium card and panel styling across feed, creator, member, and shop surfaces

## Acceptance Checklist

- [x] Next.js 15 App Router preserved
- [x] Prisma data layer preserved
- [x] Existing auth flows preserved
- [x] Existing protected route surface preserved
- [x] Feed upgraded without replacing core feed APIs
- [x] Mobile bottom navigation added
- [x] Creator directory and profile routes upgraded
- [x] Member dashboard upgraded further with recommendations and streak cues
- [x] Shop and checkout visually aligned more closely to feed-first UX
- [x] Admin feed moderation upgraded with curation filters
- [x] No destructive route or schema rewrite required for this phase
