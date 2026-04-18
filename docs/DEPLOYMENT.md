# DEPLOYMENT

Updated: 2026-04-19

## Recommended Production Baseline

- Node.js 20.x
- PostgreSQL is the recommended production provider
- `JWT_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- object storage if you need durable uploads instead of local filesystem storage

## Required Environment Variables

```env
PRISMA_DB_PROVIDER="postgresql"
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?schema=public"
JWT_SECRET="use-a-long-random-secret"
NEXT_PUBLIC_SITE_URL="https://your-domain.example"
NEXT_PUBLIC_SITE_NAME="RESURGENCE Powered by DesignXpress"
```

Optional support and email automation variables:

```env
OPENAI_API_KEY=""
OPENAI_WORKFLOW_ID=""
OPENAI_WORKFLOW_VERSION=""
OPENAI_WEBHOOK_SECRET=""
EMAIL_WEBHOOK_URL=""
EMAIL_WEBHOOK_SECRET=""
```

## Build Steps

```bash
npm install
npm run prisma:generate
npm run build
```

As of 2026-04-19, the local production build is green.

## AI Support Production Steps

1. publish the support workflow
2. set `OPENAI_WORKFLOW_ID`
3. optionally set `OPENAI_WORKFLOW_VERSION`
4. create an OpenAI project webhook for `/api/openai/webhook`
5. set `OPENAI_WEBHOOK_SECRET`
6. run:

```bash
npm run support:verify -- --base-url=https://your-domain.example --webhook-secret=whsec_...
```

## Platform Notes

- uploads currently land under `/public/uploads`
- Prisma commands should go through the npm scripts
- seeded demo accounts must be replaced or disabled before deployment

## Before You Cut Over

- rotate `JWT_SECRET`
- replace demo accounts and fallback admin values
- verify support routes in staging
- verify sponsor, cashier, staff, partner, and admin critical paths in staging
