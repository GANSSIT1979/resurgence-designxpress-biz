# VERCEL CONFIGURATION

Updated: 2026-04-19

## Repository Files

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
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require&schema=public
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
NEXT_TELEMETRY_DISABLED=1
PRISMA_HIDE_UPDATE_MESSAGE=1
```

You can copy the same list from [`../vercel.production.env.example`](../vercel.production.env.example).

Important database rule:

- do not use `localhost`, `127.0.0.1`, or the local PostGIS connection for Vercel
- use a managed PostgreSQL connection string from Vercel Storage, Prisma Postgres, Neon, Supabase, Railway, Render, or another internet-reachable provider
- if Supabase/Vercel gives you `POSTGRES_PRISMA_URL`, copy that full value into `DATABASE_URL`
- if `POSTGRES_PRISMA_URL` is unavailable, use `POSTGRES_URL`
- replace every placeholder in the URL: `USER`, `PASSWORD`, `HOST`, and `DATABASE`
- URL-encode special password characters before saving the URL, for example `@` becomes `%40`, `[` becomes `%5B`, and `]` becomes `%5D`

Supabase/Vercel mapping for this app:

```env
PRISMA_DB_PROVIDER=postgresql
DATABASE_URL=<copy the full value from POSTGRES_PRISMA_URL>
```

For schema deployment or seeding from your local machine, temporarily point `DATABASE_URL` to Supabase's direct/non-pooling URL:

```powershell
$env:PRISMA_DB_PROVIDER="postgresql"
$env:DATABASE_URL="<copy the full value from POSTGRES_URL_NON_POOLING>"
npm run db:deploy
npm run db:seed
```

Use `POSTGRES_PRISMA_URL` for Vercel runtime and `POSTGRES_URL_NON_POOLING` for one-off Prisma schema operations. This avoids pooled-connection issues during `prisma db push`.

Keep the generated Supabase variables if Vercel created them, but this app does not require Supabase Auth or Storage variables for the current Prisma-backed pages. Do not duplicate repeated variables such as `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `SUPABASE_URL`; keep one value per variable name.

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
DATABASE_URL=postgresql://PREVIEW_USER:PREVIEW_PASSWORD@PREVIEW_HOST:5432/PREVIEW_DATABASE?sslmode=require&schema=public
FORCE_HTTPS=true
NEXT_PUBLIC_SITE_URL=https://resurgence-dx.biz
```

For Vercel Development environment, use the same values only if you are intentionally connecting local `vercel dev` to remote services. Local development can keep using `.env` and SQLite.

## Database Deployment

This app currently uses a provider-switched Prisma schema and has an empty initial migration file. For a fresh Vercel PostgreSQL database, use the schema sync command below to create the tables.

Before the first production deployment, run schema deployment against the production database:

```bash
PRISMA_DB_PROVIDER=postgresql npm run db:deploy
```

For Windows PowerShell:

```powershell
$env:PRISMA_DB_PROVIDER="postgresql"
$env:DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require&schema=public"
npm run db:deploy
```

`npm run db:deploy` runs `prisma db push` after preparing the Prisma provider. If you later add real Prisma migration history, use `npm run db:migrate:deploy` instead.

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

Vercel filesystem writes are not persistent. The upload API works for local workflows, but production uploads should be moved to object storage such as S3-compatible storage, Cloudflare R2, or another persistent provider.
