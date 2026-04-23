# RESURGENCE Powered by DesignXpress

Updated: 2026-04-23
RESURGENCE Powered by DesignXpress is a Next.js 15 + Prisma platform for basketball community access, creator visibility, Official Resurgence Merch commerce, sponsorship and partnership workflows, support intake, and role-based business operations.

## Platform Snapshot

- Public discovery pages for the brand, services, sponsors, creators, partnerships, support, and commerce
- Free account creation for `MEMBER`, `CREATOR`, `COACH`, `REFEREE`, `SPONSOR`, and `PARTNER`
- Protected workspaces for admin, cashier, member, sponsor, creator, coach, referee, staff, and partner users
- Community feed experiences that connect creators, sponsor placements, merch tags, follows, likes, comments, and saved posts
- Official merch browsing, checkout, and email-based order lookup

## Stack Reality

- Framework: `Next.js 15` App Router in `src/app`
- Frontend: `React 19`
- Runtime: `Node.js 20.x`
- ORM: `Prisma`
- Database provider workflow: `scripts/prepare-prisma-schema.mjs` writes `prisma/schema.generated.prisma` based on `PRISMA_DB_PROVIDER` or `DATABASE_URL`
- This is not a WordPress site, Laravel/PHP app, or static HTML-only project

## Current Product Surface

Public routes include:

- `/`
- `/about`
- `/services`
- `/sponsors`
- `/partnerships`
- `/creators`
- `/creators/[slug]`
- `/creator/[slug]`
- `/feed`
- `/shop`
- `/shop/product/[slug]`
- `/cart`
- `/checkout`
- `/account/orders`
- `/contact`
- `/support`
- `/quotation`
- `/sponsor/apply`
- `/login`
- `/privacy`
- `/terms`

Protected role areas include:

- `/admin`
- `/cashier`
- `/member`
- `/creator/dashboard`
- `/creator/posts`
- `/coach`
- `/referee`
- `/sponsor/dashboard`
- `/staff`
- `/partner`

Compatibility pages such as `/partner/dashboard`, `/admin/revenue-monitoring`, `/cashier/revenue-monitoring`, and nested sponsor dashboard subpages are preserved for redirect/backward-compatibility purposes.

## Registration And Auth

- `/login` handles both sign-in and free account creation
- Public signup supports Gmail or mobile OTP flows
- Public signup roles are `MEMBER`, `CREATOR`, `COACH`, `REFEREE`, `SPONSOR`, and `PARTNER`
- Seeded local accounts exist for admin, cashier, sponsor, staff, partner, and creator testing
- Member, coach, and referee local testing can be exercised by signing up through `/login`

## Quick Start

```bash
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

Local HTTPS:

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

If you changed `PRISMA_DB_PROVIDER` or `DATABASE_URL`, rerun `npm run prisma:generate` before building or deploying.

## Verified Seeded Local Accounts

- System Admin: `admin@resurgence.local` / `Admin123!`
- Cashier: `cashier@resurgence.local` / `Cashier123!`
- Sponsor: `sponsor@resurgence.local` / `Sponsor123!`
- Staff: `staff@resurgence.local` / `Staff123!`
- Partner: `partner@resurgence.local` / `Partner123!`
- Creator example: `jake.anilao@resurgence.local` / `Jake@2026Resurgence!`

## Verification

```bash
npx tsc --noEmit --pretty false
npm run build
```

Support verification against a running local server:

```bash
npm run support:verify -- --base-url=http://localhost:3000
```

## Core Local URLs

- `http://localhost:3000`
- `https://localhost:3000` with `npm run dev:https`
- `http://localhost:3000/login`
- `http://localhost:3000/member`
- `http://localhost:3000/feed`
- `http://localhost:3000/shop`
- `http://localhost:3000/support`
- `http://localhost:3000/api/health`

## Documentation

Start with [docs/README.md](./docs/README.md).

Recommended references:

- [docs/INSTALL.md](./docs/INSTALL.md)
- [docs/QUICKSTART.md](./docs/QUICKSTART.md)
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- [docs/API.md](./docs/API.md)
- [docs/SHOP_MODULE.md](./docs/SHOP_MODULE.md)
- [docs/USER_GUIDE.md](./docs/USER_GUIDE.md)
- [docs/ADMIN_GUIDE.md](./docs/ADMIN_GUIDE.md)
- [docs/VERCEL.md](./docs/VERCEL.md)
- [docs/VERCEL_DEPLOYMENT_CHECKLIST.md](./docs/VERCEL_DEPLOYMENT_CHECKLIST.md)
- [docs/PHASE1_ROUTE_INTEGRATION_PLAN.md](./docs/PHASE1_ROUTE_INTEGRATION_PLAN.md)
- [docs/TROUBLESHOOTING.md](./docs/TROUBLESHOOTING.md)

## Notes

- Local development falls back to SQLite when neither `PRISMA_DB_PROVIDER` nor a provider-shaped `DATABASE_URL` is set.
- Hosted environments should use PostgreSQL and set `PRISMA_DB_PROVIDER=postgresql` or a PostgreSQL `DATABASE_URL`.
- The `docs/` folder is the canonical documentation set.
- Root-level patch-note Markdown files are retained as historical implementation notes, not the source of truth.
