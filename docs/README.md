# Documentation Index

This folder contains production, deployment, database, and feature runbooks for RESURGENCE Powered by DesignXpress.

## Core documents

| File | Purpose |
|---|---|
| `INSTALL.md` | Local setup and development commands |
| `DEPLOYMENT.md` | Vercel deployment, domain, and smoke testing |
| `DATABASE_MIGRATION_RUNBOOK.md` | Prisma/Supabase schema workflow |
| `TROUBLESHOOTING.md` | Known errors and exact fixes |
| `CREATOR_EARNINGS_PAYOUT_SYSTEM.md` | Creator earnings, affiliate, and payout system |
| `PRODUCTION_STATUS.md` | Current production health snapshot |

## Production URLs

- Website: https://www.resurgence-dx.biz
- Health endpoint: https://www.resurgence-dx.biz/api/health

## Standard verification flow

Run locally:

```bash
npm run docs:check
npm run local:preflight
npm run vercel-build
```

Deploy:

```bash
npx vercel --prod
```

Verify production:

```bash
curl -I https://www.resurgence-dx.biz
curl https://www.resurgence-dx.biz/api/health
```

## Database workflow

For the current existing Supabase/PostgreSQL database, use:

```bash
npm run db:push
npm run prisma:generate
```

Avoid:

```bash
npx prisma migrate dev --schema prisma/schema.generated.prisma
```

Reason: historical migrations do not replay cleanly into a shadow database. See `DATABASE_MIGRATION_RUNBOOK.md`.

## Documentation integrity

Check Markdown links:

```bash
npm run docs:check
```
