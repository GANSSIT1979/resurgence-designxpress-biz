# ROADMAP

Updated: 2026-04-23

## Current Phase

### Phase 1 Experience Upgrade And Release Hardening

The product is no longer in simple cleanup mode. The current phase is a combined product-and-operations pass:

- finish the TikTok-style feed, login, member, and creator experience upgrades
- keep the Cloudflare Stream media path production-safe on Vercel
- roll out additive Prisma schema changes in a migration-first way
- avoid schema drift, auth regressions, and local-disk assumptions in hosted environments

## Recently Completed

- refreshed `/login` with password login, Google auth, mobile OTP login/signup, and onboarding-style profile prompts
- upgraded `/`, `/feed`, `/member`, `/creators`, and `/creators/[slug]` into a more creator-first, mobile-focused experience
- expanded the member dashboard with profile completion, account status, notifications, saved content, uploaded posts, referral visibility, recommendations, and engagement cues
- improved creator workspace surfaces across `/creator/dashboard` and `/creator/posts`
- added the Cloudflare Stream direct-upload route at `src/app/api/media/cloudflare/direct-upload/route.ts`
- added the creator post save route at `src/app/api/creator/posts/create/route.ts`
- aligned the normalized feed model with additive `ContentPost` and `MediaAsset` fields for title, slug, metadata, original file names, and Cloudflare-friendly indexes
- documented the Vercel, Cloudflare Stream, Phase 1 route integration, and Prisma migration rollout paths

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

## Next Product Priorities

### Auth And Account Security

- add password reset and account recovery flows
- add rate limiting, retry cooldowns, and lockout protection for auth and OTP routes
- improve audit visibility around sensitive auth and admin actions

### Feed Retention And Discovery

- add view counts, share counts, and retention-oriented analytics where the data model supports them
- add hashtag/topic discovery and trending curation improvements
- add pinned or featured creator moments and better recommendation loops
- continue polishing comments, share flows, and loading states

### Creator And Member Depth

- add stronger creator analytics and tagged-merch performance views
- keep post authoring scheduling-ready without breaking the current route structure
- expand notification categories, activity history, and member personalization
- add persistent onboarding preferences when the schema is ready

### Commerce And Trust

- keep `/shop`, `/cart`, and `/checkout` visually aligned with the feed-first product direction
- improve checkout trust cues, mobile flow clarity, and post-purchase visibility
- refine creator-tagged merch and save-for-later recommendation behavior

### Support, Admin, And Operations

- improve moderation and curation workflows for featured content and sponsor placements
- strengthen support telemetry, delivery visibility, and escalation handling
- continue normalizing admin CRUD and role-safe operational tooling

## Deferred Until After The Current Rollout

- broad analytics schema expansion beyond the current additive feed/media fields
- major messaging or inbox architecture changes
- unrelated checkout, sponsor, or dashboard rewrites in the same deployment as the current Prisma/media rollout

## Release Rules

Use these guardrails for the current roadmap items:

1. merge additive schema changes first
2. review migration SQL before commit
3. apply migrations to Preview before trusting Preview behavior
4. smoke-test auth, upload, save, and feed playback before promotion
5. promote Production only after the database and matching app build are both verified
