# ARCHITECTURE

Updated: 2026-05-02

## Site Type

- application class: `React/Node`
- framework: `Next.js 15` App Router
- UI model: React server and client components under `src/app` and `src/components`
- server model: Next.js route handlers under `src/app/api`
- persistence: Prisma-backed PostgreSQL database access
- production database target: Supabase PostgreSQL through Prisma
- deployment target: Vercel with Singapore region preference where configured
- explicitly not a WordPress CMS, Laravel/PHP stack, or static-only export

## High-Level Layers

1. Public marketing, community, sponsor, and commerce pages
2. Auth, registration, role redirects, and protected dashboards
3. Creator studio, feed interactions, member personalization, and commerce surfaces
4. Sponsor CRM, invoice, revenue, and PayPal payment workflows
5. Route handlers, API wrappers, validation, RBAC, and domain helpers
6. Prisma persistence plus upload, media, storage, and observability workflows
7. External webhooks, cron automation, notifications, AI follow-ups, and alerting integrations

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
- `/payment/success`
- `/payment/cancel`
- `/login`
- `/privacy`
- `/terms`

The homepage and `/feed` both mount the creator-commerce feed. The system can fall back to gallery content when the normalized feed query path is unavailable.

## Protected Route Surface

Protected dashboard entry points include:

- `/admin`
- `/admin/invoices`
- `/admin/revenue`
- `/admin/observability`
- `/admin/sponsor-funnel`
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
- API wrapper foundation: `src/lib/api/handler.ts`
- API response helpers: `src/lib/api/response.ts`
- API guard foundation: `src/lib/api/guard.ts`

Auth flows include:

- standard password login through `/api/auth/login`
- Google sign-in and signup through `/api/auth/google`
- public mobile OTP signup through `/api/auth/mobile/request-otp` and `/api/auth/mobile/verify-otp`
- public mobile OTP login through `/api/auth/mobile/login/request-otp` and `/api/auth/mobile/login/verify-otp`
- role-based redirect after successful authentication or signup

Payment, invoice, sponsor, admin, and finance APIs should use server-side validation, role checks, and standardized error responses. Webhook routes must verify provider signatures and must not rely on normal user-session RBAC.

## Feed, Community, And Creator Layer

The public community layer includes:

- creator-commerce feed cards on `/` and `/feed`
- likes, saves, follows, comments, and share tracking
- comments modal and threaded replies
- lightweight view and watch-time tracking
- product tags and sponsor placements inside feed cards
- creator profile channel sections on `/creators/[slug]`
- creator dashboard, analytics workspace, post index, composer, and edit workspace

Important implementation notes:

- the feed is powered by the normalized `ContentPost` plus `MediaAsset` model
- the analytics layer is additive and lightweight, but it prefers direct `ContentPost` analytics fields plus `ContentPostViewSession` and keeps `metadataJson.analytics` as a rollout bridge
- public creator pages and feed reads degrade more safely when production schema drift is detected

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
- shop payment methods remain separate from the PayPal sponsor and invoice billing layer unless explicitly integrated later

## Sponsor, Invoice, And Payment Layer

The current payment architecture is PayPal-first for online sponsor and invoice workflows.

Core payment files and helpers include:

- `src/lib/payments/provider.ts` - PayPal-only online provider guardrails and PayPal environment helpers
- `src/lib/payments/enterprise.ts` - idempotency, finance audit, revenue recording, funnel metrics, and payment nudges
- `src/lib/payments/risk.ts` - payment risk scoring
- `src/lib/automation/followups.ts` - AI-assisted follow-up generation and channel dispatch

Primary online payment provider:

- PayPal

Manual payment options remain available for reviewed/manual flows:

- GCash
- Maya
- bank transfer
- cash

Stripe is not part of the active payment architecture. Stripe environment variables, routes, and webhook handlers should not be required for production operation.

Payment state should only change through:

1. server-side PayPal capture
2. verified PayPal webhook processing
3. reviewed manual payment action with audit logging

No client-side payment status should be trusted as final.

## PayPal Billing And Webhooks

Relevant payment API surfaces include:

- `/api/sponsor/checkout`
- `/api/sponsor/paypal/capture`
- `/api/invoice/paypal-preview`
- `/api/invoice/paypal-create`
- `/api/invoice/paypal-send`
- `/api/paypal/webhook`

PayPal webhook processing should include:

- webhook signature verification when `PAYPAL_WEBHOOK_ID` is configured
- idempotency check through `PaymentEvent`
- finance audit log write through `FinanceAuditLog`
- revenue metric write through `ObservabilityMetric`
- invoice or sponsor status update only after verified/captured payment

The current Prisma `InvoiceStatus` enum uses `ISSUED`, not `SENT`. Automation code that finds unpaid invoices should query `ISSUED`, `PARTIALLY_PAID`, or `OVERDUE` depending on the workflow.

## Sponsor CRM And Funnel Layer

Sponsor conversion tracking spans:

- `/sponsor/apply`
- sponsor package selection
- checkout start
- PayPal capture or invoice send
- payment completion
- sponsor approval
- follow-up and activation

Dashboard surfaces include:

- `/admin/sponsor-funnel` for package demand, payment method mix, recent sponsor leads, and conversion rate
- `/admin/revenue` for paid and outstanding revenue views
- `/admin/invoices` for invoice lifecycle management

Funnel metrics should use names such as:

- `funnel.sponsor_landing`
- `funnel.form_submitted`
- `funnel.checkout_started`
- `funnel.payment_completed`
- `conversion.invoice_sent`
- `conversion.invoice_paid`

## Automation Layer

Automation capabilities include:

- Vercel Cron endpoint for unpaid invoice reminders: `/api/cron/invoice-reminders`
- AI follow-up generation using `OPENAI_API_KEY` when configured
- fallback follow-up message generation when AI is unavailable
- optional WhatsApp, SMS, and email dispatch through webhook URLs
- audit logging for all automated finance follow-ups

Automation environment variables:

- `OPENAI_API_KEY`
- `OPENAI_DEFAULT_MODEL`
- `WHATSAPP_WEBHOOK_URL`
- `SMS_WEBHOOK_URL`
- `EMAIL_WEBHOOK_URL`
- `ALERT_WEBHOOK_URL`

If external webhook URLs are absent, automation should degrade safely by logging and auditing the intended action without crashing the payment flow.

## Observability And Metrics Layer

Observability files include:

- `src/lib/api/logger.ts` - structured JSON logs, request IDs, audit events, and redaction
- `src/lib/observability/store.ts` - best-effort persistence for logs, metrics, and alerts
- `src/lib/observability/metrics.ts` - metric emission helpers
- `src/lib/observability/alerts.ts` - alert helpers and optional external alert webhook delivery

Prisma observability models:

- `ObservabilityLog`
- `ObservabilityMetric`
- `ObservabilityAlert`
- `PaymentEvent`
- `FinanceAuditLog`

Admin surface:

- `/admin/observability`

The observability dashboard shows logs, alerts, metrics, revenue trend bars, funnel breakdowns, conversion breakdowns, log severity distribution, and slow route latency views. Persistence is best-effort and should not crash routes if tables are not available yet.

## Data Layer

- source schema: `prisma/schema.prisma`
- generated schema for Prisma CLI: `prisma/schema.generated.prisma`
- provider prep script: `scripts/prepare-prisma-schema.mjs`
- push helper: `scripts/push-prisma-schema.mjs`
- seed file: `prisma/seed.ts`

Provider behavior:

- hosted builds should use PostgreSQL
- Supabase PostgreSQL is the current production database target
- the provider is inferred from `PRISMA_DB_PROVIDER` or `DATABASE_URL`
- Prisma and runtime queries connect through `DATABASE_URL`; helper variables such as `POSTGRES_URL*` are not read automatically by app code
- build and migration commands run against `schema.generated.prisma`, not directly against the source schema file
- for the current database workflow, use `npm run db:push` and `npm run prisma:generate`
- avoid `npx prisma migrate dev` against production or the existing Supabase database unless the migration history has been cleaned and verified

Current database validation workflow:

```bash
npm run prisma:generate
npm run db:push
npm run prisma:generate
```

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

- use additive schema changes for Preview and Production where possible
- verify `/api/health` after deploy because it probes content-post, media-asset, and notification drift
- verify `/admin/observability` after schema updates to confirm metrics tables are available
- verify `/api/cron/invoice-reminders` manually before relying on Vercel Cron
- do not rely on Vercel filesystem persistence for creator media
- keep all provider secrets server-side
- do not commit real database URLs, passwords, Supabase service keys, PayPal secrets, OpenAI keys, R2 keys, or webhook secrets
- after environment changes, redeploy Vercel with build cache disabled

## Local Windows Build Note

On Windows Git Bash, spawning `npm.cmd` or `npx.cmd` from a Node script can fail with `spawnSync EINVAL`. The build wrapper should execute the local Next.js binary through `process.execPath` instead of spawning `npm.cmd` or `npx.cmd` directly.
