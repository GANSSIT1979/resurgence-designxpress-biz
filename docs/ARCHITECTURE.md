# ARCHITECTURE

Updated: 2026-04-23
## Site Type

- application class: `React/Node`
- framework: `Next.js 15` App Router
- UI model: React server and client components under `src/app` and `src/components`
- server model: Next.js route handlers under `src/app/api`
- persistence: Prisma-backed relational database access
- explicitly not a WordPress CMS, Laravel/PHP stack, or static-only export

## High-Level Layers

1. Public marketing, community, and commerce pages
2. Auth, registration, role redirects, and protected dashboards
3. Creator studio, feed interactions, and member personalization
4. Route handlers and domain helpers
5. Prisma persistence plus upload and storage workflows
6. External webhooks, notifications, and automation integrations

## Public Route Surface

Primary public pages include:

- `/`
- `/about`
- `/services`
- `/sponsors`
- `/partnerships`
- `/creators`
- `/creators/[slug]`
- `/creator/[slug]`
- `/feed`
- `/shop`
- `/shop/product/[slug]`
- `/cart`
- `/checkout`
- `/account/orders`
- `/contact`
- `/support`
- `/quotation`
- `/sponsor/apply`
- `/login`
- `/privacy`
- `/terms`

The homepage and `/feed` both mount the creator-commerce feed. The system can fall back to gallery content when the normalized feed query path is unavailable.

## Protected Route Surface

Protected dashboard entry points include:

- `/admin`
- `/cashier`
- `/member`
- `/creator/dashboard`
- `/creator/analytics`
- `/creator/posts`
- `/creator/posts/new`
- `/creator/posts/[postId]`
- `/coach`
- `/referee`
- `/sponsor/dashboard`
- `/staff`
- `/partner`

Compatibility routes such as `/partner/dashboard`, nested sponsor dashboard URLs, and older revenue-monitoring paths are preserved where needed for redirects or backward compatibility.

## Auth And Permissions

- session cookie name: `resurgence_admin_session`
- session signing and verification: `src/lib/auth.ts`
- server-side session lookup: `src/lib/session-server.ts`
- middleware protection: `src/middleware.ts`
- permission matrix: `src/lib/permissions.ts`
- role metadata and redirect mapping: `src/lib/resurgence.ts`

Auth flows include:

- standard password login through `/api/auth/login`
- Google sign-in and signup through `/api/auth/google`
- public mobile OTP signup through `/api/auth/mobile/request-otp` and `/api/auth/mobile/verify-otp`
- public mobile OTP login through `/api/auth/mobile/login/request-otp` and `/api/auth/mobile/login/verify-otp`
- role-based redirect after successful authentication or signup

## Feed, Community, And Creator Layer

The public community layer now includes:

- creator-commerce feed cards on `/` and `/feed`
- likes, saves, follows, comments, and share tracking
- comments modal and threaded replies
- lightweight view and watch-time tracking
- product tags and sponsor placements inside feed cards
- creator profile channel sections on `/creators/[slug]`
- creator dashboard, analytics workspace, post index, composer, and edit workspace

Important implementation notes:

- the feed is powered by the normalized `ContentPost` plus `MediaAsset` model
- the analytics layer is still additive and lightweight, but it now prefers direct `ContentPost` analytics fields plus `ContentPostViewSession` and keeps `metadataJson.analytics` as a rollout bridge
- public creator pages and feed reads now degrade more safely when production schema drift is detected

## Commerce Layer

Commerce capabilities include:

- public shop browsing
- product detail pages aligned with creator-linked content
- client-side cart storage
- checkout with selected variants
- transactional order creation and stock deduction
- email-based order lookup on `/account/orders`

Important nuance:

- the member dashboard can prefill order lookup links
- merch history is still keyed to checkout email, not a full server-side customer-order account model

## Data Layer

- source schema: `prisma/schema.prisma`
- generated schema for Prisma CLI: `prisma/schema.generated.prisma`
- provider prep script: `scripts/prepare-prisma-schema.mjs`
- push helper: `scripts/push-prisma-schema.mjs`
- seed file: `prisma/seed.ts`

Provider behavior:

- local development can fall back to SQLite
- hosted builds should use PostgreSQL
- the provider is inferred from `PRISMA_DB_PROVIDER` or `DATABASE_URL`
- Prisma and runtime queries still connect through `DATABASE_URL`; helper variables such as `POSTGRES_URL*` are not read automatically by app code
- build and migration commands run against `schema.generated.prisma`, not directly against the source schema file

## Media And Storage

- filesystem uploads under `public/uploads` remain local-development friendly only
- database-backed image delivery uses `/api/uploads/image/[id]`
- optional R2-backed image delivery uses `/api/uploads/r2/[...key]`
- creator video upload uses Cloudflare Stream direct upload through `/api/media/cloudflare/direct-upload`
- public video playback uses the stored media asset path, not local disk

## Operational And Support Layer

- support entry point: `/support`
- support bootstrap: `/api/chatkit/session`
- support message routing: `/api/chatkit/message`
- lead capture: `/api/chatkit/lead`
- webhook intake: `/api/openai/webhook`
- inbox and degraded workflow visibility: `PlatformNotification` plus `AutomatedEmail`

Current support routing categories:

- sponsorships
- orders
- payments
- events
- custom-apparel
- partnerships

## Deployment Safety Notes

- use migration-first rollout on Preview and Production when additive Prisma fields are introduced
- verify `/api/health` after deploy because it now probes content-post, media-asset, and notification drift
- do not rely on Vercel filesystem persistence for creator media
