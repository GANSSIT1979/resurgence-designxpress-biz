# VERCEL CONFIGURATION

Updated: 2026-04-21

For the route-by-route release gate and production rollout checks, also use [VERCEL_DEPLOYMENT_CHECKLIST.md](./VERCEL_DEPLOYMENT_CHECKLIST.md).

## Repository Files

This Vercel setup applies because the repository is a `React/Node` app built with `Next.js`, not a PHP or static-site project.

This repository includes Vercel-specific deployment files:

- `vercel.json`
- `.vercelignore`
- `vercel.production.env.example`

`vercel.json` sets:

- framework preset: `nextjs`
- install command: `npm install`
- build command: `npm run build`
- output directory: `.next`
- preferred function region: `sin1` for lower latency near the Philippines

`.vercelignore` excludes local-only files such as `.env`, `.next`, local SQLite databases, self-signed certificates, logs, and uploaded runtime files.

`vercel.production.env.example` is the copy-ready production environment checklist for Vercel.

## Vercel Project Settings

Use these settings in Vercel:

- Framework Preset: `Next.js`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `.next`
- Root Directory: repository root
- Production Branch: `main`

These values match the checked-in `vercel.json`.

## Production Domains

Configure these domains in Vercel Project Settings:

- `resurgence-dx.biz`
- `www.resurgence-dx.biz`

Vercel manages HTTPS certificates for connected domains automatically. Keep `NEXT_PUBLIC_SITE_URL` set to the canonical production URL:

```env
NEXT_PUBLIC_SITE_URL=https://resurgence-dx.biz
FORCE_HTTPS=true
```

## Required Production Environment Variables

Set these in Vercel under Project Settings > Environment Variables > Production.

```env
PRISMA_DB_PROVIDER=postgresql
DATABASE_URL=postgresql://postgres.dkipwveehizhmdiceabm:[YOUR-PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
JWT_SECRET=replace-with-a-long-random-production-secret
FORCE_HTTPS=true
NEXT_PUBLIC_SITE_URL=https://resurgence-dx.biz
NEXT_PUBLIC_SITE_NAME=Resurgence Powered by DesignXpress
COMPANY_NAME=DesignXpress Merchandising OPC
NEXT_PUBLIC_CONTACT_NAME=Jake Anilao
NEXT_PUBLIC_CONTACT_ROLE=Sponsorship / Partnerships
NEXT_PUBLIC_CONTACT_EMAIL=partnerships@resurgence-dx.biz
NEXT_PUBLIC_CONTACT_PHONE=+639387841636
NEXT_PUBLIC_SUPPORT_EMAIL=support@resurgence-dx.biz
NEXT_PUBLIC_SUPPORT_PHONE=+639957558147
NEXT_PUBLIC_BUSINESS_HOURS=Monday to Saturday, 9:00 AM to 6:00 PM, Asia/Manila
NEXT_PUBLIC_LOCATION=Philippines
NEXT_PUBLIC_CURRENCY=PHP
NEXT_PUBLIC_PAYMENT_METHODS=GCash, Maya, Bank Transfer, Credit/Debit Card, Cash
NEXT_PUBLIC_SHIPPING_AREA=Philippines nationwide
NEXT_PUBLIC_CONTACT_ADDRESS=Philippines
GCASH_NUMBER=replace-with-gcash-number
MAYA_NUMBER=
BANK_ACCOUNT_NAME=replace-with-bank-account-name
BANK_ACCOUNT_NUMBER=replace-with-bank-account-number
BANK_NAME=replace-with-bank-name
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_ID=
NEXT_TELEMETRY_DISABLED=1
PRISMA_HIDE_UPDATE_MESSAGE=1
```

You can copy the same list from [`../vercel.production.env.example`](../vercel.production.env.example).

Google sign-in note:

- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is required in Vercel for the client-side Gmail button on `/login`
- `GOOGLE_CLIENT_ID` should be set to the same value so `/api/auth/google` can verify the credential audience server-side

Important database rule:

- do not use `localhost`, `127.0.0.1`, or the local PostGIS connection for Vercel
- keep the runtime `DATABASE_URL` on the Supabase session pooler for this project
- the working runtime host is `aws-1-ap-southeast-1.pooler.supabase.com:6543`
- do not replace the runtime `DATABASE_URL` with the direct `db.dkipwveehizhmdiceabm.supabase.co:5432` host in Vercel
- URL-encode special password characters before saving the URL, for example `@` becomes `%40`, `[` becomes `%5B`, and `]` becomes `%5D`

Supabase/Vercel mapping for this app:

```env
PRISMA_DB_PROVIDER=postgresql
DATABASE_URL=postgresql://postgres.dkipwveehizhmdiceabm:[YOUR-PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
```

Admin-only direct connection string:

```env
postgresql://postgres:[YOUR-PASSWORD]@db.dkipwveehizhmdiceabm.supabase.co:5432/postgres
```

Use the direct host only for admin or maintenance work from a network that can reach it. Supabase flags that host as not IPv4-compatible, so it is not the default runtime choice for this project.

For schema deployment or seeding from your local machine, keep the pooler as the default `DATABASE_URL`. If you are on a compatible network and intentionally want the direct admin connection for a one-off task, temporarily swap it in:

```powershell
$env:PRISMA_DB_PROVIDER="postgresql"
$env:DATABASE_URL="postgresql://postgres.dkipwveehizhmdiceabm:[YOUR-PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
npm run db:deploy
npm run db:seed
```

Optional direct admin override:

```powershell
$env:PRISMA_DB_PROVIDER="postgresql"
$env:DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.dkipwveehizhmdiceabm.supabase.co:5432/postgres"
npm run db:deploy
npm run db:seed
```

Keep generated helper variables if Vercel created them, but this app's runtime `DATABASE_URL` should stay aligned with the Supabase session pooler string above. Do not duplicate repeated variables such as `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `SUPABASE_URL`; keep one value per variable name.

Generate a production `JWT_SECRET` locally before pasting it into Vercel:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
```

Optional fallback admin variables:

```env
ADMIN_EMAIL=admin@resurgence.local
ADMIN_PASSWORD_HASH=
```

Only set `ADMIN_PASSWORD_HASH` if you intentionally want the emergency fallback admin path enabled.

Optional support and automation variables:

```env
OPENAI_API_KEY=
OPENAI_WORKFLOW_ID=
OPENAI_WORKFLOW_VERSION=1
OPENAI_WEBHOOK_SECRET=
OPENAI_DEFAULT_MODEL=
EMAIL_WEBHOOK_URL=
EMAIL_WEBHOOK_SECRET=
```

`OPENAI_WORKFLOW_VERSION` should be the plain version number such as `1`. Do not use `version="1"` inside the value.

## Preview And Development Environments

For Preview, use a separate PostgreSQL database if you want realistic testing without touching production data.

Recommended Preview values:

```env
PRISMA_DB_PROVIDER=postgresql
DATABASE_URL=postgresql://PREVIEW_POOLER_USER:PREVIEW_PASSWORD@PREVIEW_POOLER_HOST:6543/PREVIEW_DATABASE?sslmode=require&pgbouncer=true
FORCE_HTTPS=true
NEXT_PUBLIC_SITE_URL=https://resurgence-dx.biz
```

For Vercel Development environment, use the same values only if you are intentionally connecting local `vercel dev` to remote services. Local development can keep using `.env` and SQLite.

## Database Deployment

This app currently uses a provider-switched Prisma schema plus repo-managed PostgreSQL hardening SQL. For a fresh Vercel PostgreSQL database, use the schema sync command below to create the tables and apply the checked-in security scripts.

Before the first production deployment, run schema deployment against the production database:

```bash
PRISMA_DB_PROVIDER=postgresql npm run db:deploy
```

For Windows PowerShell:

```powershell
$env:PRISMA_DB_PROVIDER="postgresql"
$env:DATABASE_URL="postgresql://postgres.dkipwveehizhmdiceabm:[YOUR-PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
npm run db:deploy
```

`npm run db:deploy` prepares the Prisma provider, runs `prisma db push`, and then executes the checked-in `prisma/postgres-hardening.sql` and `prisma/postgres-public-read-policies.sql` files when `PRISMA_DB_PROVIDER=postgresql`. If you later add a fully migration-driven Postgres release flow, use `npm run db:migrate:deploy` intentionally instead of mixing both approaches.

After schema deployment passes, deploy normally through Vercel. The Vercel build command runs Prisma Client generation through `npm run build`.

## Post-Deployment Checks

After deployment, verify:

- `https://resurgence-dx.biz`
- `https://resurgence-dx.biz/api/health`
- login page
- admin dashboard
- official merch storefront
- cart and checkout
- support page
- creator directory

If AI support is enabled, run:

```bash
npm run support:verify -- --base-url=https://resurgence-dx.biz --webhook-secret=whsec_...
```

## Storage Note

Vercel filesystem writes are not persistent. For merch and creator uploads, set `UPLOAD_STORAGE=r2` with Cloudflare R2 variables or use `UPLOAD_STORAGE=database` for PostgreSQL-backed upload storage. Cloudflare R2 variables are `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, and optional `R2_PUBLIC_BASE_URL`.
