# Deployment Guide

Updated: 2026-04-23
This root guide is the short deployment companion to `docs/DEPLOYMENT.md`, `docs/VERCEL.md`, and the migration rollout checklists.

## Current Accurate Summary

- This project is a `Next.js` app with Prisma-backed persistence and a generated-schema deployment flow.
- Hosted releases should use PostgreSQL, migration-first rollout, and durable media delivery.
- The current production-sensitive areas are creator feed tables, Cloudflare Stream upload, and additive Prisma schema rollout.
- `DATABASE_URL` is the actual Prisma/runtime database connection variable; `POSTGRES_URL*` and `SUPABASE_*` variables are not direct substitutes in the current codebase.

## Canonical References

- [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)
- [`docs/VERCEL.md`](./docs/VERCEL.md)
- [`docs/VERCEL_DEPLOYMENT_CHECKLIST.md`](./docs/VERCEL_DEPLOYMENT_CHECKLIST.md)
- [`docs/PRISMA_MIGRATION_ROLLOUT_CHECKLIST.md`](./docs/PRISMA_MIGRATION_ROLLOUT_CHECKLIST.md)
- [`docs/PREVIEW_RELEASE_SMOKE_TEST.md`](./docs/PREVIEW_RELEASE_SMOKE_TEST.md)
