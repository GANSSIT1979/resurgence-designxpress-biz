# Vercel Deployment Checklist

Updated: 2026-05-05

## Purpose

This checklist is the production deployment gate for RESURGENCE Powered by DesignXpress on Vercel.

## Current Deployment Assumptions

- Next.js 15 App Router
- Route handlers under `src/app/api`
- Prisma-backed PostgreSQL
- Supabase PostgreSQL in hosted environments
- Vercel production branch: `main`
- Auth cookie: `resurgence_admin_session`
- Google Auth and mobile OTP where configured
- PayPal-first sponsor/invoice billing
- Cloudflare Stream for creator video uploads where configured

## Pre-Deploy Local Checks

```bash
npm run type-check
npm run lint
npm run build
npx prisma migrate status
```

Optional docs and runtime checks when scripts exist:

```bash
npm run docs:check
npm run local:preflight
```

## Environment Variables

Required:

```txt
DATABASE_URL
PRISMA_DB_PROVIDER=postgresql
JWT_SECRET
NEXT_PUBLIC_SITE_URL
FORCE_HTTPS=true
```

Google Auth when enabled:

```txt
NEXT_PUBLIC_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
```

PayPal billing when enabled:

```txt
PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET
PAYPAL_ENV
PAYPAL_CURRENCY
PAYPAL_SPONSOR_AMOUNT
PAYPAL_WEBHOOK_ID
NEXT_PUBLIC_BASE_URL
```

Cloudflare Stream when enabled:

```txt
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_STREAM_TOKEN
CLOUDFLARE_STREAM_CUSTOMER_CODE
CLOUDFLARE_STREAM_ALLOWED_ORIGINS
CLOUDFLARE_STREAM_MAX_DURATION_SECONDS
CLOUDFLARE_REQUIRE_SIGNED_URLS
```

Support when enabled:

```txt
OPENAI_API_KEY
OPENAI_WORKFLOW_ID
OPENAI_WORKFLOW_VERSION
OPENAI_WEBHOOK_SECRET
OPENAI_DEFAULT_MODEL
```

## Database Readiness

Before deploying code that queries new Prisma fields:

1. prepare Prisma schema
2. generate Prisma Client
3. apply schema changes to Preview database
4. deploy Preview
5. smoke-test Preview
6. apply schema changes to Production database
7. deploy Production

Current safe Supabase sync path:

```bash
npm run db:push
npm run prisma:generate
```

Migration-first releases should use reviewed migrations and deploy them intentionally. Do not mix `db:push` and migration deployment casually in the same release.

## Media And Storage

Do not rely on Vercel local filesystem persistence for uploads. Use:

- Cloudflare Stream for creator video
- database-backed image delivery through `/api/uploads/image/[id]`
- R2/object storage through `/api/uploads/r2/[...key]`

## Required Smoke Tests

Public routes:

```txt
/
/feed
/creators
/creators/[slug]
/shop
/shop/product/[slug]
/cart
/checkout
/account/orders
/support
/login
/api/health
```

Protected routes:

```txt
/member
/creator/dashboard
/creator/posts
/admin
/admin/invoices
/admin/revenue
/admin/observability
/cashier
/staff
/partner
/sponsor/dashboard
```

Flow checks:

- password login
- Google login/signup
- mobile OTP if enabled
- role redirect
- feed read
- like/save/comment guard behavior
- product to cart
- checkout creation
- support message
- PayPal sandbox sponsor/invoice flow when billing changes
- Cloudflare upload/save/playback when media changes

## Health Checks

```bash
curl -I https://www.resurgence-dx.biz
curl https://www.resurgence-dx.biz/api/health
```

Expected:

```txt
HTTP/1.1 200 OK
```

Health JSON should show database connected and no unexpected schema issues.

## Go / No-Go

Do not promote if any of these occur:

- missing table or missing column errors
- failed Google Auth on production domain
- failed PayPal capture or webhook route after billing changes
- creator upload works but save fails
- save works but public playback fails after publish
- protected routes are publicly accessible
- `/api/health` reports blocking drift

## Rollback

If app code is bad but schema is additive and harmless, roll back the Vercel deployment and keep the schema. Prefer forward fixes for additive schema issues when possible.

## Final Commit/Deploy Flow

```bash
git status
git add -A
git commit -m "Describe production-safe change"
git push origin main
```

Confirm Vercel deploys the expected commit SHA.
