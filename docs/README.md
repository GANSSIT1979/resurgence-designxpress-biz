# RESURGENCE Documentation

Updated: 2026-04-19

## Snapshot

RESURGENCE Powered by DesignXpress is a Next.js 15 + Prisma platform for sponsorship operations, live support routing, Official Resurgence Merch commerce, creators, and role-based dashboards.

## Current Repository State

- The active app lives in `src/`.
- `npx tsc --noEmit --pretty false` passes.
- `npm run build` passes.
- `npm run support:verify` passes against a running local server.
- The live Prisma workflow used by npm scripts is `scripts/prepare-prisma-schema.mjs` plus `prisma/schema.prisma`.
- `prisma/schema.template.prisma` and `scripts/prepare-prisma.mjs` remain in the repo as legacy artifacts and are not the default script path.

## Canonical Docs

- [INSTALL.md](./INSTALL.md)
- [QUICKSTART.md](./QUICKSTART.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [API.md](./API.md)
- [SHOP_MODULE.md](./SHOP_MODULE.md)
- [DATABASE.md](./DATABASE.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [CONFIGURATION.md](./CONFIGURATION.md)
- [SECURITY.md](./SECURITY.md)
- [TESTING.md](./TESTING.md)
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- [CHANGELOG.md](./CHANGELOG.md)
- [USER_GUIDE.md](./USER_GUIDE.md)
- [ADMIN_GUIDE.md](./ADMIN_GUIDE.md)
- [ROADMAP.md](./ROADMAP.md)
- [AI_SUPPORT_PRODUCTION.md](./AI_SUPPORT_PRODUCTION.md)

## Recommended Read Order

1. `INSTALL.md`
2. `QUICKSTART.md`
3. `CONFIGURATION.md`
4. `DATABASE.md`
5. `API.md`
6. `SHOP_MODULE.md`
7. `AI_SUPPORT_PRODUCTION.md`
8. `TROUBLESHOOTING.md`
9. `ROADMAP.md`

## Primary Working Areas

- Public site: discovery pages, sponsor apply, contact, support, creators, official merch, cart, checkout
- Commerce: official merch catalog, selected variants, public order lookup, admin merch products, admin merch orders
- Internal roles: admin, cashier, sponsor, creator, staff, partner
- Support automation: session bootstrap, message routing, lead capture, webhook verification
- CMS and operations: creators, gallery, sponsors, packages, submissions, reports, settings
- Finance: invoices, transactions, receipts, cashier summaries and exports

## Documentation Policy

The `docs/` folder is the source of truth. Root Markdown notes in the repo root are retained as historical implementation references only.
