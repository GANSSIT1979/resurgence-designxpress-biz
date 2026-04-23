# ARCHITECTURE

Updated: 2026-04-23

## Site Type

- Application class: `React/Node`
- Framework: `Next.js 15` App Router
- UI model: React server and client components under `src/app` and `src/components`
- Server model: Next.js route handlers under `src/app/api`
- Persistence: Prisma-backed relational database access
- Explicitly not a WordPress CMS, Laravel/PHP stack, or static-only export

## High-Level Layers

1. Public marketing, community, and commerce pages
2. Auth, registration, role redirects, and protected dashboards
3. Route handlers and domain helpers
4. Prisma persistence and upload/storage workflows
5. External webhooks, notifications, and automation integrations

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

The homepage and `/feed` both mount the creator-commerce feed experience, with fallbacks into gallery content when feed tables are unavailable.

## Protected Dashboards

Protected dashboard entry points include:

- `/admin`
- `/cashier`
- `/member`
- `/creator/dashboard`
- `/creator/posts`
- `/coach`
- `/referee`
- `/sponsor/dashboard`
- `/staff`
- `/partner`

Role experience shape:

- `MEMBER` has a dedicated dashboard that aggregates orders, follows, saved posts, community highlights, merch recommendations, and notifications
- `CREATOR`, `SPONSOR`, `PARTNER`, `STAFF`, `CASHIER`, and `SYSTEM_ADMIN` have workflow-oriented dashboards
- `COACH` and `REFEREE` currently use lighter community dashboard shells that prepare for future profile and coordination workflows

Compatibility routes such as `/partner/dashboard` and nested `/sponsor/dashboard/*` paths redirect into their primary top-level destinations.

## Auth And Permissions

- session cookie name: `resurgence_admin_session`
- session signing and verification: `src/lib/auth.ts`
- server-side session lookup: `src/lib/session-server.ts`
- protected route middleware: `src/middleware.ts`
- permission matrix: `src/lib/permissions.ts`
- role metadata and redirect mapping: `src/lib/resurgence.ts`

Auth flows include:

- standard login through `/api/auth/login`
- public Gmail signup through `/api/auth/google`
- public mobile OTP signup through `/api/auth/mobile/request-otp` and `/api/auth/mobile/verify-otp`
- role-based redirect after successful authentication or signup

## Community And Commerce Layer

Community feed capabilities include:

- public feed reads
- creator follow/unfollow
- like/unlike, comment, and save/unsave interactions
- product tags that deep-link into merch
- promoted sponsor placements
- admin moderation support

Commerce capabilities include:

- public shop browsing
- client-side cart storage
- checkout with selected variants
- transactional order creation and stock deduction
- email-based order lookup on `/account/orders`

Important commerce nuance:

- the member dashboard can prefill order lookup links for the signed-in user
- the merch order system is still email-based and is not a server-side customer account order history model

## API Domains

Route handlers in `src/app/api` cover:

- auth and session
- public inquiries and sponsor submissions
- feed and creator-commerce interactions
- support routing and lead capture
- merch listing and checkout
- notifications and uploads
- sponsor, partner, staff, and cashier workflows
- admin CRUD and reporting modules

## Data Layer

- source schema: `prisma/schema.prisma`
- generated schema for Prisma CLI: `prisma/schema.generated.prisma`
- provider prep script: `scripts/prepare-prisma-schema.mjs`
- seed file: `prisma/seed.ts`

Provider behavior:

- local development can fall back to SQLite
- hosted builds should use PostgreSQL
- the provider is inferred from `PRISMA_DB_PROVIDER` or `DATABASE_URL`

## Support And Automation Flow

1. A visitor opens `/support`.
2. The widget checks `/api/chatkit/session`.
3. Messages are posted to `/api/chatkit/message`.
4. Lead capture posts to `/api/chatkit/lead`.
5. The server creates `Inquiry`, `PlatformNotification`, and `AutomatedEmail` records.
6. Signed webhook events can be received on `/api/openai/webhook`.

Current support routing categories are:

- sponsorships
- orders
- payments
- events
- custom-apparel
- partnerships

## Storage And Integrations

- Prisma for relational data
- browser local storage for cart state
- filesystem uploads under `public/uploads` for local development
- database-backed uploads served through `/api/uploads/image/[id]` for serverless/database-backed deployment modes
- optional R2-backed delivery through `/api/uploads/r2/[...key]`
- optional OpenAI workflow credentials
- optional email webhook delivery through `EMAIL_WEBHOOK_URL`
