# Local Setup Guide

Updated: 2026-04-19

This root guide is the short local bootstrap companion to `docs/INSTALL.md` and `docs/QUICKSTART.md`.

## Commands

```bash
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

If you change `PRISMA_DB_PROVIDER`, run `npm run prisma:generate` before the database commands.

## Verify Locally

- `http://localhost:3000`
- `http://localhost:3000/login`
- `http://localhost:3000/support`
- `http://localhost:3000/api/health`

## Demo Accounts

- System Admin: `admin@resurgence.local` / `ChangeMe123!`
- Cashier: `cashier@resurgence.local` / `Cashier123!`
- Sponsor: `sponsor@resurgence.local` / `Sponsor123!`
- Staff: `staff@resurgence.local` / `Staff123!`
- Partner: `partner@resurgence.local` / `Partner123!`

## Local Checks

```bash
npx tsc --noEmit --pretty false
npm run build
```

Support check:

```bash
npm run support:verify -- --base-url=http://localhost:3000
```
