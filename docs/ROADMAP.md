# ROADMAP

Updated: 2026-04-25

## Current Phase

### Phase 1 Experience Upgrade And Release Hardening

The product is no longer in simple cleanup mode. The current phase is a combined product-and-operations pass:

- finish the TikTok-style feed, login, member, and creator experience upgrades
- keep the Cloudflare Stream media path production-safe on Vercel
- roll out additive Prisma schema changes in a migration-first way
- avoid schema drift, auth regressions, and local-disk assumptions in hosted environments
- keep all new public and dashboard flows mobile-first so they can be reused by the Android/iOS app track

## Recently Completed

- refreshed `/login` with password login, Google auth, mobile OTP login/signup, and onboarding-style profile prompts
- upgraded `/`, `/feed`, `/member`, `/creators`, and `/creators/[slug]` into a more creator-first, mobile-focused experience
- expanded the member dashboard with profile completion, account status, notifications, saved content, uploaded posts, referral visibility, recommendations, and engagement cues
- improved creator workspace surfaces across `/creator/dashboard` and `/creator/posts`
- added the Cloudflare Stream direct-upload route at `src/app/api/media/cloudflare/direct-upload/route.ts`
- added the creator post save route at `src/app/api/creator/posts/create/route.ts`
- aligned the normalized feed model with additive `ContentPost` and `MediaAsset` fields for title, slug, metadata, original file names, and Cloudflare-friendly indexes
- documented the Vercel, Cloudflare Stream, Phase 1 route integration, Prisma migration rollout, production status, and DevOps monitoring paths

## Active Release Track

### 1. Prisma Migration Rollout

This is the main production gate for the current feed/media work.

- generate and review the additive migration for the current Prisma schema
- apply the migration to Vercel Preview PostgreSQL before trusting Preview UI behavior
- verify `/`, `/feed`, `/creator/dashboard`, and the creator save flow against the migrated Preview database
- promote the exact same reviewed migration to Production before routing new code to traffic

### 2. Cloudflare Stream Production Readiness

- confirm Preview and Production both have the required Cloudflare Stream environment variables
- smoke-test direct upload, Prisma save, and playback on `/feed`
- keep upload and save routes role-gated and session-aware
- continue serving media through Cloudflare or API-backed delivery instead of local filesystem storage

### 3. Feed And Dashboard Stabilization

- watch for missing-table or missing-column errors after migration rollout
- watch for PostgreSQL pool timeout bursts during normal page loads
- keep fallback behavior stable when feed content, media assets, or notifications are missing
- tighten any duplicated or overly expensive dashboard/feed queries discovered during Preview testing

### 4. Android And iOS Mobile Compatibility

This track prepares Resurgence for a native mobile app while preserving the existing Next.js web platform.

Recommended mobile stack:

- Expo React Native for Android and iOS
- shared API contract from the existing Next.js `/api/*` routes
- shared auth/session model where possible
- Cloudflare Stream playback for feed videos
- mobile-safe image upload through the existing upload APIs or R2-backed upload route
- payment handoff support for web checkout, GCash/Maya instructions, and future native payment integrations

Mobile MVP scope:

- member login/signup
- TikTok-style feed viewer
- creator profile pages
- member dashboard summary
- shop/product browsing
- cart handoff to web checkout
- support/chat entry point
- push-notification-ready notification model

Mobile release stages:

1. define API contracts for feed, auth, member dashboard, creators, products, cart, and support
2. create `/apps/mobile` Expo workspace or separate mobile repo linked to this backend
3. implement shared environment config for staging and production API base URLs
4. add Android internal testing build pipeline
5. add iOS TestFlight build pipeline
6. add mobile smoke tests for login, feed playback, creator profile, shop browsing, and support entry
7. prepare Play Store and App Store metadata, icons, screenshots, privacy labels, and data safety forms

Compatibility rules:

- mobile must call server APIs, not connect directly to Prisma or PostgreSQL
- secrets remain server-side only
- mobile auth must respect the same RBAC boundaries as web
- upload flows must use durable storage, not local filesystem paths
- mobile checkout may start as a secure web checkout handoff before native payment flows are added

## Next Product Priorities

### Auth And Account Security

- add password reset and account recovery flows
- add rate limiting, retry cooldowns, and lockout protection for auth and OTP routes
- improve audit visibility around sensitive auth and admin actions
- expose mobile-compatible auth endpoints and token/session refresh behavior for Android/iOS clients

### Feed Retention And Discovery

- add view counts, share counts, and retention-oriented analytics where the data model supports them
- add hashtag/topic discovery and trending curation improvements
- add pinned or featured creator moments and better recommendation loops
- continue polishing comments, share flows, and loading states
- ensure feed pagination, video playback metadata, and saved-post actions are efficient for native mobile clients

### Creator And Member Depth

- add stronger creator analytics and tagged-merch performance views
- keep post authoring scheduling-ready without breaking the current route structure
- expand notification categories, activity history, and member personalization
- add persistent onboarding preferences when the schema is ready
- prepare creator/member surfaces for mobile-first navigation, push notifications, and compact analytics summaries

### Commerce And Trust

- keep `/shop`, `/cart`, and `/checkout` visually aligned with the feed-first product direction
- improve checkout trust cues, mobile flow clarity, and post-purchase visibility
- refine creator-tagged merch and save-for-later recommendation behavior
- support mobile app cart creation with secure web checkout handoff before native payments

### Support, Admin, And Operations

- improve moderation and curation workflows for featured content and sponsor placements
- strengthen support telemetry, delivery visibility, and escalation handling
- continue normalizing admin CRUD and role-safe operational tooling
- keep support/chat endpoints compatible with mobile clients and future push notifications

### DevOps And Release Automation

- keep production status generated from live `/api/health`
- keep deployment scoring as the release gate for preview promotion
- maintain last-known-good deployment tracking for safe rollback
- add guarded auto-rollback only after repeated failures and explicit config enablement
- expand scoring to include mobile API smoke tests once Android/iOS clients are active

## Deferred Until After The Current Rollout

- broad analytics schema expansion beyond the current additive feed/media fields
- major messaging or inbox architecture changes
- unrelated checkout, sponsor, or dashboard rewrites in the same deployment as the current Prisma/media rollout
- native payment processing inside mobile apps until web checkout handoff is stable
- offline-first mobile mode until core mobile auth, feed, media, and shop browsing are stable

## Release Rules

Use these guardrails for the current roadmap items:

1. merge additive schema changes first
2. review migration SQL before commit
3. apply migrations to Preview before trusting Preview behavior
4. smoke-test auth, upload, save, feed playback, and mobile API compatibility before promotion
5. promote Production only after the database and matching app build are both verified
6. do not ship Android/iOS clients that require direct database access or server-side secrets
