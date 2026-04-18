# ARCHITECTURE

Updated: 2026-04-19

## High-Level Layers

1. Public marketing and commerce pages
2. Role-based dashboards
3. Route handlers and domain helpers
4. Prisma persistence
5. Optional external webhooks and workflow integrations

## UI Layer

Public routes include:

- `/`
- `/about`
- `/services`
- `/sponsors`
- `/sponsor/apply`
- `/contact`
- `/support`
- `/shop`
- `/cart`
- `/checkout`
- `/account/orders`
- `/creators`
- `/creators/[slug]`
- `/creator/[slug]`

Protected dashboard entry points:

- `/admin`
- `/cashier`
- `/creator/dashboard`
- `/sponsor/dashboard`
- `/staff`
- `/partner`

Creator dashboard access is available for configured `CREATOR` role accounts. Creator records also appear as public profile content managed by admin tools.

The Official Resurgence Merch flow uses public browsing, client-side cart state, checkout, and email order lookup. Order review happens on `/account/orders` through checkout email lookup rather than a signed-in customer account session.

## Auth And Permissions

- session cookie name: `resurgence_admin_session`
- session signing: `src/lib/auth.ts`
- server-side session lookup: `src/lib/session-server.ts`
- route protection: `src/middleware.ts`
- permission matrix: `src/lib/permissions.ts`

Middleware protects `/admin`, `/cashier`, `/staff`, `/partner`, the sponsor portal routes, and `/api/*`.

## Server Layer

The route handlers in `src/app/api` cover:

- auth
- public inquiries and sponsor submissions
- support routing and lead capture
- official merch listing, checkout, and admin merch management
- admin CRUD modules
- sponsor, partner, staff, and cashier workflows
- uploads, notifications, and health checks

For commerce specifically, merch browsing is backed by public shop APIs, checkout posts selected variants to `/api/checkout`, and cart state is stored client-side in the browser rather than in a dedicated server-side cart service.

## Data Layer

- active schema: `prisma/schema.prisma`
- active prep script: `scripts/prepare-prisma-schema.mjs`
- seed file: `prisma/seed.ts`

The package scripts mutate the datasource provider directly in `prisma/schema.prisma`. The older template-based path remains in the repo for reference only.

## Support And Automation Flow

1. A visitor opens `/support`.
2. The widget checks `/api/chatkit/session`.
3. Messages are posted to `/api/chatkit/message`.
4. Lead capture posts to `/api/chatkit/lead`.
5. The server creates `Inquiry`, `PlatformNotification`, and `AutomatedEmail` records.
6. Signed OpenAI-style webhook events can be received on `/api/openai/webhook`.

## Storage And Integrations

- Prisma for relational data
- local filesystem uploads under `public/uploads`
- optional OpenAI workflow credentials
- optional email webhook delivery through `EMAIL_WEBHOOK_URL`
