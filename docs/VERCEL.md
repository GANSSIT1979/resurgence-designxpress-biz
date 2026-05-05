# Vercel Configuration

Updated: 2026-05-05

## Purpose

This document defines Vercel configuration for RESURGENCE Powered by DesignXpress.

## Project Type

- Framework: Next.js 15 App Router
- Runtime: React/Node
- API: Next.js route handlers under `src/app/api`
- Database: Prisma-backed PostgreSQL
- Hosted database target: Supabase PostgreSQL
- Deployment: Vercel

This is not a WordPress, Laravel/PHP, or static-only app.

## Repository Files

Expected deployment files:

```txt
vercel.json
.vercelignore
vercel.production.env.example
```

Recommended Vercel settings:

```txt
Framework Preset: Next.js
Install Command: npm install
Build Command: npm run build
Output Directory: .next
Root Directory: repository root
Production Branch: main
Function Region: sin1 where configured
```

## Production Domains

Configure these domains in Vercel:

```txt
resurgence-dx.biz
www.resurgence-dx.biz
login.resurgence-dx.biz
```

Recommended canonical public site URL:

```env
NEXT_PUBLIC_SITE_URL=https://resurgence-dx.biz
FORCE_HTTPS=true
```

## Required Runtime Environment Variables

```env
PRISMA_DB_PROVIDER=postgresql
DATABASE_URL=postgresql://POOLER_USER:POOLER_PASSWORD@POOLER_HOST:6543/postgres?sslmode=require&pgbouncer=true
JWT_SECRET=replace-with-long-random-production-secret
FORCE_HTTPS=true
NEXT_PUBLIC_SITE_URL=https://resurgence-dx.biz
NEXT_PUBLIC_SITE_NAME=Resurgence Powered by DesignXpress
COMPANY_NAME=DesignXpress Merchandising OPC
NEXT_TELEMETRY_DISABLED=1
PRISMA_HIDE_UPDATE_MESSAGE=1
```

## Google Auth Variables

Required when Google login/signup is enabled:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

`NEXT_PUBLIC_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID` should use the same Google OAuth client ID. The secret stays server-side only.

## Support Variables

```env
OPENAI_API_KEY=
OPENAI_WORKFLOW_ID=
OPENAI_WORKFLOW_VERSION=1
OPENAI_WEBHOOK_SECRET=
OPENAI_DEFAULT_MODEL=gpt-4.1-mini
EMAIL_WEBHOOK_URL=
EMAIL_WEBHOOK_SECRET=
```

## OTP Variables

```env
OTP_DELIVERY_MODE=demo
SMS_WEBHOOK_URL=
SMS_WEBHOOK_SECRET=
```

Use `demo` only for setup/testing. Use webhook delivery for production OTP.

## PayPal Variables

```env
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_ENV=sandbox
PAYPAL_CURRENCY=PHP
PAYPAL_SPONSOR_AMOUNT=1000.00
PAYPAL_WEBHOOK_ID=
NEXT_PUBLIC_BASE_URL=https://www.resurgence-dx.biz
```

`PAYPAL_ENV` must be exactly `sandbox` or `live`. Do not include inline comments in Vercel env values.

## Cloudflare Stream Variables

```env
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_STREAM_TOKEN=
CLOUDFLARE_STREAM_CUSTOMER_CODE=
CLOUDFLARE_STREAM_ALLOWED_ORIGINS=https://www.resurgence-dx.biz,https://resurgence-dx.biz
CLOUDFLARE_STREAM_MAX_DURATION_SECONDS=180
CLOUDFLARE_REQUIRE_SIGNED_URLS=false
```

Keep signed playback disabled until signed playback tokens are wired into `/feed`.

## Upload Storage Variables

```env
UPLOAD_STORAGE=r2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_BASE_URL=
```

Vercel filesystem storage is not durable. Use database-backed upload delivery, Cloudflare R2, or Cloudflare Stream.

## Manual Payment Variables

```env
GCASH_NUMBER=
MAYA_NUMBER=
BANK_ACCOUNT_NAME=
BANK_ACCOUNT_NUMBER=
BANK_NAME=
```

Do not commit real bank or wallet details into docs.

## Optional Platform Helper Variables

These may exist but are not read directly by the app unless mapped into `DATABASE_URL`:

```txt
POSTGRES_URL
POSTGRES_PRISMA_URL
POSTGRES_URL_NON_POOLING
POSTGRES_PASSWORD
```

Unused in current app code:

```txt
SUPABASE_SECRET_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPABASE_JWT_SECRET
```

## Database Deployment

For current Supabase/PostgreSQL sync:

```bash
npm run db:push
npm run prisma:generate
```

For migration-first releases, generate and review migration SQL locally, deploy to Preview first, then Production.

## Post-Deployment Checks

```bash
curl -I https://www.resurgence-dx.biz
curl https://www.resurgence-dx.biz/api/health
```

Manual checks:

- `/login`
- `/feed`
- `/shop`
- `/cart`
- `/checkout`
- `/support`
- `/admin` for authorized admin
- `/admin/invoices`
- `/admin/revenue`
- `/admin/observability`

## Deployment Protection

OAuth and webhook callback routes must be publicly reachable on the domains used by Google, PayPal, OpenAI, or external webhook providers. Do not test callbacks on a protected Preview domain unless the provider can access it.
