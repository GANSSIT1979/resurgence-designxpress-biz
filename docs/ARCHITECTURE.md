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
- `/creator/[slug]`

Protected dashboard entry points:

- `/admin`
- `/cashier`
- `/sponsor/dashboard`
- `/staff`
- `/partner`

The current app does not have a dedicated creator login or creator dashboard. Creator records are public profile content managed by admin tools.

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
- shop listing and checkout
- admin CRUD modules
- sponsor, partner, staff, and cashier workflows
- uploads, notifications, and health checks

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
