# VERCEL CONFIGURATION

Updated: 2026-04-25

## Current Production State

- Canonical domain: https://www.resurgence-dx.biz
- Active deployment: `dpl_EMHduw5CD8eSk3NVZgCkR6tqBLWj`
- Region: `sin1`
- Build command: `npm run vercel-build`

## Required Build Configuration

`vercel.json` must use:

```json
"buildCommand": "npm run vercel-build"
```

And `package.json` must include:

```json
"vercel-build": "npm run prisma:generate && next build"
```

## Required Environment Variables (Production + Preview)

```env
PRISMA_DB_PROVIDER=postgresql
DATABASE_URL=postgresql://POOLER_USER:POOLER_PASSWORD@POOLER_HOST:6543/postgres?sslmode=require&pgbouncer=true
DIRECT_URL=postgresql://DIRECT_USER:DIRECT_PASSWORD@DIRECT_HOST:5432/postgres?sslmode=require
JWT_SECRET=...
NEXT_PUBLIC_SITE_URL=https://www.resurgence-dx.biz
FORCE_HTTPS=true
```

## Critical Rules

- `DATABASE_URL` is the runtime source of truth
- `DIRECT_URL` is required for Prisma migrations
- never rely only on `POSTGRES_URL*` variables
- never commit secrets

## Deployment Flow

```bash
npm run vercel-build
npx vercel --prod
```

Then alias:

```bash
npx vercel alias set <deployment>.vercel.app www.resurgence-dx.biz --scope resurgence-designxpress-projects
```

## Verification

```bash
curl -I https://www.resurgence-dx.biz
curl https://www.resurgence-dx.biz/api/health
```

Expected:

- HTTP 200
- latest deployment ID in `_next` assets
- database connected
- schema OK

## Known Log Behavior

- Old deployments may still show `DATABASE_URL not found`
- Only check logs for the latest deployment ID
- `/api/openai/webhook` returning 400 is expected for unsigned requests

## Notes

- Vercel filesystem is not persistent
- use R2 or database for uploads
- keep region `sin1` for PH latency
