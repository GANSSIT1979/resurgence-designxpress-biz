# Feed Release Handoff

Updated: 2026-04-23
## Purpose

This document is the merge and deployment handoff for the TikTok-inspired creator-commerce upgrade.

The implementation was intentionally split into small, reversible PRs so feed, creator, sponsor, admin, shop, verification, and runtime tooling can be merged in order and rolled back by layer if needed.

## Release Stack

Merge in this order:

1. `#1` Phase 1 to 4: schema and migration foundation
2. `#2` Phase 5 to 6: public feed MVP
3. `#3` Phase 7: creator post management
4. `#5` Phase 8: sponsor feed placements
5. `#6` Phase 9: admin feed moderation
6. `#7` Phase 10: feed-to-cart shop integration
7. `#8` Phase 11: feed performance and recovery hardening
8. `#9` Phase 12: final verification gate
9. `#10` runtime smoke verification tools

## What Each Layer Adds

- `#1` introduces the Prisma feed models, relations, and safe migration path.
- `#2` introduces the public creator-commerce feed routes, serializers, mutations, and homepage/feed integration.
- `#3` adds creator post authoring and creator-side management.
- `#5` adds sponsor placements and sponsor-side feed campaign support.
- `#6` adds admin moderation and visibility control surfaces.
- `#7` connects feed product tags to the existing merch cart and checkout flow.
- `#8` improves deferred media loading, optimistic interactions, and route recovery states.
- `#9` adds the repeatable final verification gate with `npm run phase12:verify`.
- `#10` adds reusable runtime smoke verification and a safer support verifier for non-ready webhook environments.

## Pre-Merge Prerequisites

Before merging the stack into the production branch:

- confirm `DATABASE_URL` points to the production PostgreSQL database
- confirm `PRISMA_DB_PROVIDER=postgresql`
- confirm `NEXT_PUBLIC_SITE_URL=https://resurgence-dx.biz`
- confirm auth, OpenAI, payment, and storage env vars are set in Vercel
- confirm the production database has backups or point-in-time recovery enabled

## Required Verification Before Final Merge

Run these on the top branch after the full stack is present:

```bash
npm run phase12:verify
npx prisma validate
npx tsc --noEmit --pretty false
npm run build
```

For local runtime verification:

```bash
npx next start -p 3027
npm run runtime:verify -- --base-url=http://127.0.0.1:3027
npm run support:verify -- --base-url=http://127.0.0.1:3027
```

## Production Deployment Sequence

1. Merge the PR stack in order.
2. Pull the top branch into the final production branch.
3. Deploy to Vercel preview first.
4. Confirm schema preparation and Prisma generation succeed in the build logs.
5. Promote to production only after preview verification passes.

## Preview Verification Checklist

- homepage loads and shows the creator-commerce feed
- `/feed` loads and route recovery files compile correctly
- login page loads
- support page loads and support route health is available
- `/creators` and creator profile pages load
- `/shop`, `/cart`, `/checkout`, and at least one merch product page load
- feed API reads return `200`
- unauthenticated feed write routes return `401`
- creator dashboard and creator posts page load
- sponsor dashboard and sponsor placements page load
- admin feed moderation page loads
- admin users page still loads
- cashier dashboard still loads

## Rollback Guidance

Rollback by the highest risky layer first:

1. If runtime tooling or verification docs are the problem, revert `#10`.
2. If the final verification gate is the problem, revert `#9`.
3. If media loading or optimistic interaction behavior is the problem, revert `#8`.
4. If cart integration from feed is the problem, revert `#7`.
5. If moderation is the problem, revert `#6`.
6. If sponsor placements are the problem, revert `#5`.
7. If creator authoring is the problem, revert `#3`.
8. If the public feed itself is the problem, revert `#2`.
9. Revert `#1` only if the schema rollout itself is the source of failure and only after confirming data implications.

## High-Risk Areas To Watch

- Prisma migration state versus deployed database state
- local or shared Windows `node_modules/.prisma` engine locks during repeated local builds
- webhook readiness mismatches in environments where `OPENAI_WEBHOOK_SECRET` is present but not production-ready
- production media/storage configuration if uploads are exercised beyond existing flows

## Shipping Recommendation

Recommended final merge target is the top verified branch after all draft PRs are reviewed in order.

If the team wants one final promotion branch, create it from the tip of `codex/feed-runtime-smoke`, run the full verification commands again, then deploy from that branch.
