# ROADMAP

Updated: 2026-05-01

## Current Phase

### Phase 1 Experience Upgrade, Release Hardening, And PayPal Billing Stabilization

The product is no longer in simple cleanup mode. The current phase is a combined product, monetization, and operations pass:

- finish the TikTok-style feed, login, member, and creator experience upgrades
- keep the Cloudflare Stream media path production-safe on Vercel
- roll out additive Prisma schema changes in a migration-first way
- stabilize PayPal-first sponsor checkout, invoice billing, capture, webhook sync, and revenue dashboards
- avoid schema drift, auth regressions, local-disk assumptions, payment-provider ambiguity, and unsafe secret handling in hosted environments

## Recently Completed

- refreshed `/login` with password login, Google auth, mobile OTP login/signup, and onboarding-style profile prompts
- upgraded `/`, `/feed`, `/member`, `/creators`, and `/creators/[slug]` into a more creator-first, mobile-focused experience
- expanded the member dashboard with profile completion, account status, notifications, saved content, uploaded posts, referral visibility, recommendations, and engagement cues
- improved creator workspace surfaces across `/creator/dashboard` and `/creator/posts`
- added the Cloudflare Stream direct-upload route at `src/app/api/media/cloudflare/direct-upload/route.ts`
- added the creator post save route at `src/app/api/creator/posts/create/route.ts`
- aligned the normalized feed model with additive `ContentPost` and `MediaAsset` fields for title, slug, metadata, original file names, and Cloudflare-friendly indexes
- added PayPal sponsor checkout through `/api/sponsor/checkout`
- added PayPal order capture through `/api/sponsor/paypal/capture`
- added PayPal invoice preview through `/api/invoice/paypal-preview`
- added PayPal invoice persistence through `/api/invoice/paypal-create`
- added PayPal invoice sending through `/api/invoice/paypal-send`
- added PayPal webhook sync through `/api/paypal/webhook`
- added the invoice dashboard at `/admin/invoices`
- added the revenue dashboard at `/admin/revenue` with paid revenue, outstanding revenue, unpaid invoice alerts, invoice conversion, and sponsor funnel metrics
- documented the Vercel, Cloudflare Stream, Phase 1 route integration, Prisma migration rollout, and PayPal billing system paths

## Active Release Track

### 1. Prisma Migration Rollout

This is the main production gate for the current feed, media, invoice, sponsor, and dashboard work.

- generate and review additive migrations for the current Prisma schema
- apply migrations to Vercel Preview PostgreSQL before trusting Preview UI behavior
- verify `/`, `/feed`, `/creator/dashboard`, and the creator save flow against the migrated Preview database
- verify `/admin/invoices`, `/admin/revenue`, PayPal invoice creation, PayPal invoice sending, sponsor checkout, and webhook updates against the migrated Preview database
- promote the exact same reviewed migration to Production before routing new code to traffic

### 2. Cloudflare Stream Production Readiness

- confirm Preview and Production both have the required Cloudflare Stream environment variables
- smoke-test direct upload, Prisma save, and playback on `/feed`
- keep upload and save routes role-gated and session-aware
- continue serving media through Cloudflare or API-backed delivery instead of local filesystem storage

### 3. PayPal Billing Production Readiness

- confirm Preview and Production both have valid PayPal environment variables: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_ENV`, `PAYPAL_CURRENCY`, `PAYPAL_SPONSOR_AMOUNT`, `PAYPAL_WEBHOOK_ID`, and `NEXT_PUBLIC_BASE_URL`
- keep `PAYPAL_ENV` values exact (`sandbox` or `live`) with no inline comments in Vercel environment values
- verify sponsor application, PayPal order creation, PayPal return flow, capture, and sponsor status update
- verify PayPal invoice creation, sending, customer payment, webhook delivery, and local invoice status update to `PAID`
- verify `/admin/invoices` and `/admin/revenue` after webhook-driven payment updates
- keep GCash as manual/reference-based payment support and PayPal as the primary online billing provider
- remove or avoid new Stripe assumptions unless a deliberate multi-provider strategy is approved

### 4. Feed And Dashboard Stabilization

- watch for missing-table or missing-column errors after migration rollout
- watch for PostgreSQL pool timeout bursts during normal page loads
- keep fallback behavior stable when feed content, media assets, invoices, sponsor submissions, or notifications are missing
- tighten any duplicated or overly expensive dashboard/feed/billing queries discovered during Preview testing

## Next Product Priorities

### Auth And Account Security

- add password reset and account recovery flows
- add rate limiting, retry cooldowns, and lockout protection for auth, OTP, checkout, invoice, and webhook-adjacent routes
- improve audit visibility around sensitive auth, admin, payment, invoice, and sponsor actions

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

### Commerce, Invoicing, And Trust

- keep `/shop`, `/cart`, and `/checkout` visually aligned with the feed-first product direction
- improve checkout trust cues, mobile flow clarity, and post-purchase visibility
- refine creator-tagged merch and save-for-later recommendation behavior
- add invoice detail pages under `/admin/invoices/[id]`
- add admin actions for resend invoice, mark manual payments, cancel invoice, and download invoice records
- add payment reminder automation for unpaid invoices
- add optional invoice PDF generation once the invoice data model is stable

### Sponsor Funnel And Revenue Operations

- stabilize DAYO sponsor package selection, PayPal payment flow, GCash reference flow, and sponsor status automation
- improve sponsor CRM status transitions and sponsor package reporting
- expand `/admin/revenue` with time-based revenue charts and payment-provider breakdowns
- add conversion tracking for sponsor application to payment completion
- add unpaid invoice and pending sponsor follow-up workflows

### Support, Admin, And Operations

- improve moderation and curation workflows for featured content and sponsor placements
- strengthen support telemetry, delivery visibility, and escalation handling
- continue normalizing admin CRUD and role-safe operational tooling
- add audit logs for billing and sponsor lifecycle changes

## Deferred Until After The Current Rollout

- broad analytics schema expansion beyond the current additive feed/media/billing fields
- major messaging or inbox architecture changes
- broad multi-tenant billing architecture changes
- unrelated checkout provider rewrites in the same deployment as the current Prisma/media/billing rollout
- switching PayPal from sandbox to live before end-to-end sandbox invoice, checkout, webhook, and dashboard verification is complete

## Release Rules

Use these guardrails for the current roadmap items:

1. merge additive schema changes first
2. review migration SQL before commit
3. apply migrations to Preview before trusting Preview behavior
4. smoke-test auth, upload, save, feed playback, sponsor checkout, PayPal invoice send, PayPal capture, webhook sync, and revenue dashboards before promotion
5. promote Production only after the database, environment variables, PayPal webhook configuration, and matching app build are all verified
6. rotate any exposed secrets before production deployment and never commit real secrets to markdown, logs, or repository files
7. redeploy Vercel with Build Cache OFF after payment, Prisma, or environment-variable changes
