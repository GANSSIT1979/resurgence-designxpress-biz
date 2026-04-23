# RESURGENCE Documentation

Updated: 2026-04-23
## Snapshot

RESURGENCE Powered by DesignXpress is a Next.js 15 + Prisma platform for basketball community access, creator-commerce feed experiences, Official Resurgence Merch commerce, sponsor and partner workflows, and role-based operations.

## Current Repository State

- The active app lives in `src/`.
- `npx tsc --noEmit --pretty false` passes.
- `npm run build` passes.
- `npm run support:verify` passes against a running local server.
- The Prisma provider workflow is `scripts/prepare-prisma-schema.mjs` plus `prisma/schema.prisma` -> `prisma/schema.generated.prisma`.
- Environment variable source of truth is `docs/CONFIGURATION.md`; Prisma/runtime database access is keyed off `DATABASE_URL`.
- Public signup now covers free member, creator, coach, referee, sponsor, and partner registration through `/login`.
- The member experience now includes a dedicated `/member` dashboard alongside the public `/feed` and merch flows.

## Documentation Map

Getting started:

- [INSTALL.md](./INSTALL.md)
- [QUICKSTART.md](./QUICKSTART.md)
- [CONFIGURATION.md](./CONFIGURATION.md)
- [DATABASE.md](./DATABASE.md)

Architecture and reference:

- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [API.md](./API.md)
- [SHOP_MODULE.md](./SHOP_MODULE.md)
- [SECURITY.md](./SECURITY.md)
- [TESTING.md](./TESTING.md)

User and operator guides:

- [USER_GUIDE.md](./USER_GUIDE.md)
- [ADMIN_GUIDE.md](./ADMIN_GUIDE.md)
- [AI_SUPPORT_PRODUCTION.md](./AI_SUPPORT_PRODUCTION.md)
- [RUNTIME_VERIFICATION.md](./RUNTIME_VERIFICATION.md)

Deployment and operations:

- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [VERCEL.md](./VERCEL.md)
- [VERCEL_DEPLOYMENT_CHECKLIST.md](./VERCEL_DEPLOYMENT_CHECKLIST.md)
- [VERCEL_CLOUDFLARE_STREAM_MERGE.md](./VERCEL_CLOUDFLARE_STREAM_MERGE.md)
- [PRISMA_MIGRATION_ROLLOUT_CHECKLIST.md](./PRISMA_MIGRATION_ROLLOUT_CHECKLIST.md)
- [PRISMA_CONTENTPOST_COMMENT_SCHEMA_INTEGRATION.md](./PRISMA_CONTENTPOST_COMMENT_SCHEMA_INTEGRATION.md)
- [PRISMA_CONTENTPOST_ANALYTICS_SCHEMA_INTEGRATION.md](./PRISMA_CONTENTPOST_ANALYTICS_SCHEMA_INTEGRATION.md)
- [contentpost-analytics-migration-checks.sql](./contentpost-analytics-migration-checks.sql)
- [PREVIEW_RELEASE_SMOKE_TEST.md](./PREVIEW_RELEASE_SMOKE_TEST.md)
- [PHASE1_ROUTE_INTEGRATION_PLAN.md](./PHASE1_ROUTE_INTEGRATION_PLAN.md)
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- [CHANGELOG.md](./CHANGELOG.md)
- [ROADMAP.md](./ROADMAP.md)

Historical implementation handoff and phase notes:

- [FEED_RELEASE_HANDOFF.md](./FEED_RELEASE_HANDOFF.md)
- [FEED_UPGRADE_PHASE_1_4.md](./FEED_UPGRADE_PHASE_1_4.md)
- [FEED_UPGRADE_PHASE_5_6.md](./FEED_UPGRADE_PHASE_5_6.md)
- [FEED_UPGRADE_PHASE_7.md](./FEED_UPGRADE_PHASE_7.md)
- [FEED_UPGRADE_PHASE_8.md](./FEED_UPGRADE_PHASE_8.md)
- [FEED_UPGRADE_PHASE_9.md](./FEED_UPGRADE_PHASE_9.md)
- [FEED_UPGRADE_PHASE_10.md](./FEED_UPGRADE_PHASE_10.md)
- [FEED_UPGRADE_PHASE_11.md](./FEED_UPGRADE_PHASE_11.md)
- [FEED_UPGRADE_PHASE_12.md](./FEED_UPGRADE_PHASE_12.md)
- [CODEBASE_TASK_PROPOSALS.md](./CODEBASE_TASK_PROPOSALS.md)

## Recommended Read Order

If you are onboarding to the codebase:

1. `INSTALL.md`
2. `QUICKSTART.md`
3. `CONFIGURATION.md`
4. `DATABASE.md`
5. `ARCHITECTURE.md`
6. `API.md`
7. `SHOP_MODULE.md`
8. `USER_GUIDE.md`
9. `ADMIN_GUIDE.md`
10. `VERCEL.md`
11. `VERCEL_DEPLOYMENT_CHECKLIST.md`
12. `PRISMA_MIGRATION_ROLLOUT_CHECKLIST.md`
13. `PREVIEW_RELEASE_SMOKE_TEST.md`
14. `PHASE1_ROUTE_INTEGRATION_PLAN.md`
15. `TROUBLESHOOTING.md`

If you are validating the live product surface:

1. `USER_GUIDE.md`
2. `ADMIN_GUIDE.md`
3. `API.md`
4. `SHOP_MODULE.md`
5. `AI_SUPPORT_PRODUCTION.md`
6. `RUNTIME_VERIFICATION.md`

## Primary Working Areas

- Public site: discovery pages, creators, sponsors, partnerships, support, quotation, and commerce
- Community layer: homepage feed, `/feed`, creator follows, saved posts, promoted placements, and member dashboard highlights
- Commerce: shop, cart, checkout, order lookup, admin products, admin orders
- Auth: login, Gmail signup, mobile OTP signup, role-based redirects, and protected route middleware
- Role access: admin, cashier, member, sponsor, creator, coach, referee, staff, and partner
- Operations: inquiries, notifications, automated emails, creator content, gallery media, sponsor records, partner workflows, cashier reports

## Documentation Policy

The `docs/` folder is the source of truth. Root Markdown files outside `docs/` are retained as historical implementation notes unless a document explicitly says otherwise.

Environment accuracy policy:

- `DATABASE_URL` is the current database connection source of truth
- `PRISMA_DB_PROVIDER` is the optional provider override for generated-schema prep
- `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING`, and `POSTGRES_PASSWORD` are optional platform helper variables, not direct runtime requirements in this repo
- `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_JWT_SECRET` are unused in the current codebase
