# Local Setup Guide

Updated: 2026-04-24
This root guide is the short local bootstrap companion to `docs/INSTALL.md` and `docs/QUICKSTART.md`.

## Commands

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

Accuracy notes:

- `DATABASE_URL` is the Prisma/runtime source of truth in this repo
- local setup does not require `POSTGRES_URL*` or `SUPABASE_*` variables
- `npm run local:preflight` is the optional bootstrap check for local setup

## Verify Locally

- `http://localhost:3000`
- `http://localhost:3000/feed`
- `http://localhost:3000/login`
- `http://localhost:3000/member`
- `http://localhost:3000/creator/posts`
- `http://localhost:3000/support`
- `http://localhost:3000/api/health`

## Demo Accounts

- These are the default credentials created by the current local seed flow.
- Rerun `npm run db:seed` against a fresh local database before relying on them for a clean local test pass.

- System Admin: `admin@resurgence.local` / `Admin123!`
- Cashier: `cashier@resurgence.local` / `Cashier123!`
- Sponsor: `sponsor@resurgence.local` / `Sponsor123!`
- Staff: `staff@resurgence.local` / `Staff123!`
- Partner: `partner@resurgence.local` / `Partner123!`
- Creator example: `jake.anilao@resurgence.local` / `Jake@2026Resurgence!`

## Local Checks

```bash
npx tsc --noEmit --pretty false
npm run build
```

Support check:

```bash
npm run support:verify -- --base-url=http://localhost:3000
```
