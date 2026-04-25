# Production Status

Updated: 2026-04-25

This document is the current source of truth for the live Resurgence Powered by DesignXpress production deployment.

## Live URLs

| Surface | URL | Status |
|---|---|---|
| Canonical site | https://www.resurgence-dx.biz | Live |
| Vercel deployment | `resurgence-designxpress-qo92fzor4.vercel.app` | Ready |
| Health endpoint | https://www.resurgence-dx.biz/api/health | Healthy |

## Latest Verified Deployment

```text
dpl_EMHduw5CD8eSk3NVZgCkR6tqBLWj
```

Verified with:

```bash
curl -I https://www.resurgence-dx.biz
curl https://www.resurgence-dx.biz/api/health
curl -I https://www.resurgence-dx.biz/sponsors
```

Expected indicators:

- HTTP `200 OK`
- `Server: Vercel`
- `_next` asset query contains the current deployment ID
- `/api/health` reports `database: connected`
- `/api/health` reports `schema.status: ok`

## Verified Health Snapshot

Latest known healthy shape:

```json
{
  "ok": true,
  "status": "ok",
  "database": "connected",
  "aiConfigured": true,
  "support": {
    "apiKeyConfigured": true,
    "workflowIdConfigured": true,
    "workflowVersionConfigured": true,
    "promptIdConfigured": true,
    "promptVersionConfigured": true,
    "webhookSecretConfigured": true,
    "chatkitReady": true,
    "webhookReady": true,
    "missing": []
  },
  "schema": {
    "status": "ok",
    "issues": []
  },
  "counts": {
    "users": 14,
    "sponsors": 4,
    "packages": 4
  }
}
```

Counts are expected to change as production data changes. The important checks are `ok`, database connectivity, support readiness, and schema status.

## Runtime Environment Requirements

Production and Preview must include:

```env
PRISMA_DB_PROVIDER=postgresql
DATABASE_URL=postgresql://POOLER_USER:POOLER_PASSWORD@POOLER_HOST:6543/postgres?sslmode=require&pgbouncer=true
DIRECT_URL=postgresql://DIRECT_USER:DIRECT_PASSWORD@DIRECT_HOST:5432/postgres?sslmode=require
JWT_SECRET=...
NEXT_PUBLIC_SITE_URL=https://www.resurgence-dx.biz
FORCE_HTTPS=true
```

AI support requires:

```env
OPENAI_API_KEY=...
OPENAI_WORKFLOW_ID=...
OPENAI_WORKFLOW_VERSION=...
OPENAI_WEBHOOK_SECRET=...
```

## Deployment Command Path

```bash
npm run vercel-build
npx vercel --prod
```

`vercel-build` must run:

```bash
npm run prisma:generate && next build
```

Prisma generation must pass through:

```text
scripts/prepare-prisma-schema.mjs
prisma/schema.prisma -> prisma/schema.generated.prisma
```

## Domain Alias Procedure

After production deploy:

```bash
npx vercel inspect <deployment-url>.vercel.app
npx vercel alias set <deployment-url>.vercel.app www.resurgence-dx.biz --scope resurgence-designxpress-projects
```

Verify:

```bash
curl -I https://www.resurgence-dx.biz
```

The response should reference the latest deployment ID in the `_next` asset query.

## Log Interpretation

Ignore old `DATABASE_URL` errors when the log filter is pinned to old deployment IDs. Only investigate errors from the active deployment ID.

Known historical deployment IDs that may appear in stale logs:

```text
dpl_BCi4hFbfoCNQ8UFKk67Jvg15c7fL
dpl_CsQbQooGoLvcP81z3Lkx2a6bFzkD
```

Webhook route notes:

- `POST /api/openai/webhook` may return `400` for unsigned, malformed, or manual test requests.
- A `400` is only actionable if it comes from a real OpenAI webhook delivery using the configured production secret.

## Production Validation Checklist

Before calling production healthy, verify:

- [ ] `curl -I https://www.resurgence-dx.biz` returns `200 OK`
- [ ] response assets reference latest deployment ID
- [ ] `curl https://www.resurgence-dx.biz/api/health` returns `ok: true`
- [ ] health reports `database: connected`
- [ ] health reports `schema.status: ok`
- [ ] `/sponsors` returns `200 OK`
- [ ] no new latest-deployment Prisma env errors appear in Vercel logs
