# INSTALL

Updated: 2026-04-21

## Site Type

- This repository is a `React/Node` application built with `Next.js`.
- Local setup requires `Node.js`; it is not a PHP or static-site install flow.

## Requirements

- Node.js 20.x
- npm 10+
- SQLite for local development
- PostgreSQL is supported when you want a production-style provider
- OpenAI credentials only if you are enabling workflow-backed support verification

## Install Steps

```bash
cp .env.example .env
npm install
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
npm run db:push
npm run db:seed
npm run dev
```

Optional Windows local HTTPS:

```powershell
npm run dev:https
```

`npm install` already runs Prisma generate through `postinstall`. If you change `PRISMA_DB_PROVIDER`, rerun `npm run prisma:generate`.

## First Local Checks

- Open `http://localhost:3000`
- Open `https://localhost:3000` when running `npm run dev:https`
- Open `http://localhost:3000/login`
- Open `http://localhost:3000/support`
- Open `http://localhost:3000/api/health`

## Demo Accounts

- System Admin: `admin@resurgence.local` / `Admin123!`
- Cashier: `cashier@resurgence.local` / `Cashier123!`
- Sponsor: `sponsor@resurgence.local` / `Sponsor123!`
- Staff: `staff@resurgence.local` / `Staff123!`
- Partner: `partner@resurgence.local` / `Partner123!`

## Optional Verification

```bash
npx tsc --noEmit --pretty false
npm run build
```

Support verification:

```bash
npm run support:verify -- --base-url=http://localhost:3000
```
