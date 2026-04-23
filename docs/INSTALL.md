# INSTALL

Updated: 2026-04-24
## Site Type

- this repository is a `React/Node` application built with `Next.js`
- local setup requires `Node.js`
- it is not a PHP or static-site install flow

## Requirements

- Node.js 20.x
- npm 10+
- SQLite for local development by default
- PostgreSQL when you want hosted or production-style parity
- OpenAI credentials only if you are enabling workflow-backed support verification

## Install Steps

```bash
cp .env.example .env
npm install
npm run local:preflight
npm run db:push
npm run db:seed
npm run dev
```

Optional local HTTPS:

```bash
npm run dev:https
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
npm install
npm run local:preflight
npm run db:push
npm run db:seed
npm run dev
```

If you change `PRISMA_DB_PROVIDER` or `DATABASE_URL`, rerun `npm run prisma:generate`.

Optional local bootstrap check:

```bash
npm run local:preflight
```

Accuracy notes:

- `DATABASE_URL` is the current Prisma/runtime database source of truth
- `.env.example` is designed for local setup and does not require `POSTGRES_URL*` or `SUPABASE_*` variables

## First Local Checks

- open `http://localhost:3000`
- open `http://localhost:3000/feed`
- open `http://localhost:3000/login`
- open `http://localhost:3000/member`
- open `http://localhost:3000/support`
- open `http://localhost:3000/api/health`

## Seeded Local Accounts

- These are the default credentials created by the current local seed flow.
- Rerun `npm run db:seed` against a fresh local database before relying on them for a clean test pass.

- System Admin: `admin@resurgence.local` / `Admin123!`
- Cashier: `cashier@resurgence.local` / `Cashier123!`
- Sponsor: `sponsor@resurgence.local` / `Sponsor123!`
- Staff: `staff@resurgence.local` / `Staff123!`
- Partner: `partner@resurgence.local` / `Partner123!`
- Creator example: `jake.anilao@resurgence.local` / `Jake@2026Resurgence!`

## Optional Verification

```bash
npx tsc --noEmit --pretty false
npm run build
```

Support verification:

```bash
npm run support:verify -- --base-url=http://localhost:3000
```
