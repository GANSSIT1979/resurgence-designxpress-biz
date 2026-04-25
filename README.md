# Resurgence Powered by DesignXpress

Production-ready Next.js platform for DesignXpress creator commerce, merch ordering, sponsor/partner workflows, role-based dashboards, AI support, and operational administration.

## Current Production Status

- Canonical site: https://www.resurgence-dx.biz
- Latest verified production deployment: `dpl_EMHduw5CD8eSk3NVZgCkR6tqBLWj`
- Hosting: Vercel, region `sin1`
- Runtime database: Supabase PostgreSQL through pooled `DATABASE_URL`
- Migration/admin database URL: non-pooled `DIRECT_URL`
- Health endpoint: `/api/health`

Latest verified health response showed:

- app status: `ok`
- database: `connected`
- schema: `ok`
- AI support: configured
- users: 14
- sponsors: 4
- packages: 4

## Stack

- Next.js 15 App Router
- React 19
- Prisma 6
- PostgreSQL via Supabase
- Vercel hosting
- Cloudflare R2/Stream-ready upload architecture
- OpenAI workflow and ChatKit support integration

## Key Scripts

```bash
npm run prisma:prepare
npm run prisma:generate
npm run dev
npm run build
npm run vercel-build
npm run db:validate
npm run db:deploy
npm run db:migrate:deploy
npm run local:preflight
npm run support:verify
```

`vercel-build` must exist because `vercel.json` uses it as the production build command.

## Local Setup

Use Node.js 20.x.

```bash
npm install
npm run prisma:prepare
npm run prisma:generate
npm run local:preflight
npm run dev
```

For Supabase/PostgreSQL local testing, `.env.local` must include:

```env
PRISMA_DB_PROVIDER=postgresql
DATABASE_URL=postgresql://POOLER_USER:POOLER_PASSWORD@POOLER_HOST:6543/postgres?sslmode=require&pgbouncer=true
DIRECT_URL=postgresql://DIRECT_USER:DIRECT_PASSWORD@DIRECT_HOST:5432/postgres?sslmode=require
```

Do not commit real `.env`, `.env.local`, database URLs, service-role keys, webhook secrets, or API keys.

## Deployment

Production deployment is Vercel-based:

```bash
npm run vercel-build
npx vercel --prod
```

After deployment, confirm the latest deployment is aliased to the canonical domain:

```bash
npx vercel alias set <deployment-url>.vercel.app www.resurgence-dx.biz --scope resurgence-designxpress-projects
```

Verify:

```bash
curl -I https://www.resurgence-dx.biz
curl https://www.resurgence-dx.biz/api/health
curl -I https://www.resurgence-dx.biz/sponsors
```

Expected result: HTTP `200 OK`, latest deployment ID in `_next` asset query, and `/api/health` reporting database and schema `ok`.

## Documentation

Primary docs:

- [Deployment](./docs/DEPLOYMENT.md)
- [Vercel configuration](./docs/VERCEL.md)
- [Database](./docs/DATABASE.md)
- [Troubleshooting](./docs/TROUBLESHOOTING.md)
- [Vercel deployment checklist](./docs/VERCEL_DEPLOYMENT_CHECKLIST.md)
- [Prisma migration rollout checklist](./docs/PRISMA_MIGRATION_ROLLOUT_CHECKLIST.md)

## Important Runtime Notes

- `DATABASE_URL` is required in Vercel Production and Preview.
- `DIRECT_URL` is required when the Prisma schema uses `directUrl = env("DIRECT_URL")`.
- `PRISMA_DB_PROVIDER=postgresql` is required for hosted builds.
- Old Vercel logs from previous deployment IDs may still show missing `DATABASE_URL`; only investigate logs from the active production deployment.
- Unsigned or malformed requests to `/api/openai/webhook` may correctly return `400`.

## Security

Rotate any secrets that were pasted into chat, logs, or committed by mistake. Keep production credentials in Vercel Environment Variables only.
