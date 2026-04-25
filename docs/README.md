# RESURGENCE Documentation

Updated: 2026-04-25

## Source of Truth Docs (Read First)

- [PRODUCTION_STATUS.md](./PRODUCTION_STATUS.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [VERCEL.md](./VERCEL.md)
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

These documents reflect the current live system and override historical notes when conflicts exist.

## Snapshot

Resurgence Powered by DesignXpress is a Next.js 15 + Prisma platform for:

- creator-commerce feed
- merch ordering and checkout
- sponsor and partner workflows
- AI-powered support
- multi-role dashboards (admin, cashier, creator, member, sponsor, partner)

## Documentation Layers

### 1. Canonical (Always Up-to-Date)

- PRODUCTION_STATUS.md
- DEPLOYMENT.md
- VERCEL.md
- TROUBLESHOOTING.md

### 2. System Reference

- CONFIGURATION.md
- DATABASE.md
- ARCHITECTURE.md
- API.md
- SECURITY.md

### 3. Operations

- VERCEL_DEPLOYMENT_CHECKLIST.md
- PRISMA_MIGRATION_ROLLOUT_CHECKLIST.md
- PREVIEW_RELEASE_SMOKE_TEST.md

### 4. Historical / Phase Notes (Do Not Treat as Current Truth)

- FEED_UPGRADE_PHASE_*
- *_PATCH_NOTES.md
- *_NOTES.md

These are retained for audit and rollout history only.

## Recommended Read Order

1. PRODUCTION_STATUS.md
2. DEPLOYMENT.md
3. VERCEL.md
4. TROUBLESHOOTING.md
5. CONFIGURATION.md
6. DATABASE.md

## Documentation Rules

- `PRODUCTION_STATUS.md` is the runtime truth
- deployment docs must reflect actual working commands
- environment docs must match Vercel configuration
- historical notes must not override canonical docs

## Repository Notes

- App code: `src/`
- Prisma schema flow: `schema.prisma -> schema.generated.prisma`
- Runtime DB source: `DATABASE_URL`
- Migration/admin DB: `DIRECT_URL`

## Validation Tools

```bash
npm run local:preflight
npm run docs:check
npm run support:verify
```

## Production Reality Principle

If documentation conflicts:

1. Trust `PRODUCTION_STATUS.md`
2. Then trust live `/api/health`
3. Then trust latest deployment logs

Everything else is secondary.
