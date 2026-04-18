# Local Setup Guide

Updated: 2026-04-16

This root guide is the short local bootstrap companion to `docs/INSTALL.md` and `docs/QUICKSTART.md`.

## Commands

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run db:push
npm run db:seed
npm run dev
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
npm install
npm run prisma:generate
npm run db:push
npm run db:seed
npm run dev
```

## Verify Locally

- `http://localhost:3000`
- `http://localhost:3000/login`
- `http://localhost:3000/support`
- `http://localhost:3000/api/health`

## Demo Accounts

- Admin: `admin@resurgence.local` / `Admin123!`
- Cashier: `cashier@resurgence.local` / `Cashier123!`
- Sponsor: `sponsor@resurgence.local` / `Sponsor123!`
- Staff: `staff@resurgence.local` / `Staff123!`
- Partner: `partner@resurgence.local` / `Partner123!`

## Support Check

```bash
npm run support:verify -- --base-url=http://localhost:3000
```

## Current Caveat

The app can be run locally, but full repository build cleanup is still in progress. See `docs/TROUBLESHOOTING.md` for the current blockers.
