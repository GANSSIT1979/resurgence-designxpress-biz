# Install

## Environment

The canonical root template is:

[.env.example](../.env.example)

From the repository root:

```bash
cp .env.example .env
cp .env.example .env.local
```

Then update `.env` and `.env.local` with real local or production-safe development values.

Required Prisma values:

```env
PRISMA_DB_PROVIDER="postgresql"
DATABASE_URL="postgres://USER:PASSWORD@HOST:6543/postgres?sslmode=require&pgbouncer=true"
DIRECT_URL="postgres://USER:PASSWORD@HOST:5432/postgres?sslmode=require"
```

## Setup

```bash
npm install
npm run prisma:generate
npm run local:preflight
npm run dev
```

## Production checks

```bash
npm run docs:production-status
npm run docs:production-status:check
npm run docs:check
npm run vercel-build
```
