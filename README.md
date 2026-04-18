# RESURGENCE Powered by DesignXpress

Updated: 2026-04-19

RESURGENCE Powered by DesignXpress is a Next.js 15 + Prisma platform for public sponsorship marketing, support intake, commerce, and role-based operations for admin, cashier, sponsor, staff, and partner users.

## Current Status

- The active application lives in `src/`.
- `npx tsc --noEmit --pretty false` passes.
- `npm run build` passes.
- `npm run support:verify` passes against a running local instance.
- The `docs/` folder is the canonical documentation set.
- Root-level patch-note Markdown files are historical notes, not the source of truth.

## Product Areas

- Public pages: `/`, `/about`, `/services`, `/sponsors`, `/creator/[slug]`, `/contact`, `/support`, `/shop`, `/cart`, `/checkout`, `/sponsor/apply`
- Protected dashboards: `/admin`, `/cashier`, `/sponsor/dashboard`, `/staff`, `/partner`
- Sponsor portal pages: `/sponsor/applications`, `/sponsor/packages`, `/sponsor/deliverables`, `/sponsor/billing`, `/sponsor/profile`
- Support APIs: `/api/chatkit/session`, `/api/chatkit/message`, `/api/chatkit/lead`, `/api/openai/webhook`
- Commerce and finance APIs: shop products, checkout, invoices, transactions, receipts, reports
- Admin CMS and operations APIs: users, sponsors, packages, submissions, creator network, gallery media, reports, settings, shop data

## Quick Start

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

If you change `PRISMA_DB_PROVIDER`, rerun `npm run prisma:generate` before pushing, migrating, or building.

## Demo Accounts

- System Admin: `admin@resurgence.local` / `Admin123!`
- Cashier: `cashier@resurgence.local` / `Cashier123!`
- Sponsor: `sponsor@resurgence.local` / `Sponsor123!`
- Staff: `staff@resurgence.local` / `Staff123!`
- Partner: `partner@resurgence.local` / `Partner123!`

## Verification

```bash
npx tsc --noEmit --pretty false
npm run build
```

Support verification:

```bash
npm run support:verify -- --base-url=http://localhost:3000
```

## Core URLs

- `http://localhost:3000`
- `http://localhost:3000/login`
- `http://localhost:3000/support`
- `http://localhost:3000/api/health`

## Documentation

Start with [`docs/README.md`](./docs/README.md).

Recommended references:

- [`docs/INSTALL.md`](./docs/INSTALL.md)
- [`docs/QUICKSTART.md`](./docs/QUICKSTART.md)
- [`docs/API.md`](./docs/API.md)
- [`docs/DATABASE.md`](./docs/DATABASE.md)
- [`docs/AI_SUPPORT_PRODUCTION.md`](./docs/AI_SUPPORT_PRODUCTION.md)
- [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md)

## Notes

- Local development defaults to SQLite with `prisma/dev.db`.
- Production deployments can switch to PostgreSQL through `PRISMA_DB_PROVIDER=postgresql`.
- The Prisma prep step wired into npm scripts is `scripts/prepare-prisma-schema.mjs`.
