# DEPLOYMENT

Updated: 2026-04-16

## Recommended Production Baseline

- Node.js 20.x
- PostgreSQL
- Prisma prepared from `prisma/schema.template.prisma`
- strong `AUTH_SECRET`
- object storage for uploads instead of local disk

## Required Environment Variables

```env
PRISMA_DB_PROVIDER=postgresql
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?schema=public"
AUTH_SECRET="use-a-long-random-secret"
NEXT_PUBLIC_SITE_URL="https://your-domain.example"

OPENAI_API_KEY=""
OPENAI_WORKFLOW_ID=""
OPENAI_WORKFLOW_VERSION=""
OPENAI_WEBHOOK_SECRET=""
OPENAI_DEFAULT_MODEL="gpt-4.1-mini"
```

## Build Steps

```bash
npm install
npm run prisma:generate
npm run build
```

## Deployment Readiness Note

The documentation reflects the intended deployment path, but the repository is not yet fully deployment-ready. As of 2026-04-16:

- `npx tsc --noEmit` still fails in legacy modules
- `npm run build` stops first on the missing `@/lib/sponsor-server` helper

Treat deployment as blocked until those code issues are repaired.

## AI Support Production Steps

1. Publish the OpenAI Agent Builder workflow
2. Save the workflow ID to `OPENAI_WORKFLOW_ID`
3. Optionally pin a deployed version in `OPENAI_WORKFLOW_VERSION`
4. Create an OpenAI project webhook for `/api/openai/webhook`
5. Save the signing secret to `OPENAI_WEBHOOK_SECRET`
6. Run:

```bash
npm run support:verify -- --base-url=https://your-domain.example --webhook-secret=whsec_...
```

## Platform Notes

- `/public/uploads` is acceptable for local work, not serious production storage
- Prisma commands should always go through the npm scripts so the prepared schema stays in sync
- use a managed PostgreSQL service for production

## Recommended Hosts

- Vercel
- Railway
- Render
- Docker or VPS hosting

## Before You Cut Over

- finish the current build stabilization backlog
- replace demo secrets and demo accounts
- verify support routes in staging
- verify sponsor, cashier, and admin critical paths in staging
