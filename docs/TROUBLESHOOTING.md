# TROUBLESHOOTING

Updated: 2026-04-23
## Prisma Client Or Provider Looks Wrong

Run:

```bash
npm run prisma:generate
```

Then restart the dev server or rebuild. This is especially important after changing `PRISMA_DB_PROVIDER` or `DATABASE_URL`.

If the environment still looks wrong, verify that you did not set only `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, or `POSTGRES_URL_NON_POOLING` without also setting `DATABASE_URL`.

## Hosted Build Fails With A ContentPost Column Error

If you see an error like:

```text
The column `ContentPost.title` does not exist in the current database.
```

the code is ahead of the hosted PostgreSQL schema.

Do this next:

1. apply the reviewed migration to Preview or Production
2. verify `GET /api/health`
3. retest `/`, `/feed`, `/creators/[slug]`, and `/creator/dashboard`

Use:

- `docs/PRISMA_MIGRATION_ROLLOUT_CHECKLIST.md`
- `docs/PREVIEW_RELEASE_SMOKE_TEST.md`

## Windows Prisma `EPERM` Rename Error

If Prisma fails with an error like:

```text
EPERM: operation not permitted, rename ...query_engine-windows.dll.node
```

stop any local `node.exe` or `next` processes that still have the Prisma engine open, then rerun the build or generate step.

## Support Verifier Returns `ECONNREFUSED`

The verifier does not start the app for you. Start the dev or production server first, then run:

```bash
npm run support:verify -- --base-url=http://localhost:3000
```

## Health Endpoint Reports Schema Drift

Check `GET /api/health`.

The health probe now checks:

- additive `ContentPost` columns
- additive `MediaAsset` columns
- `PlatformNotification.actorUserId`
- support readiness

If `/api/health` reports schema mismatch, do not trust Preview or Production route behavior until the database is aligned.

## Upload Or Cloudflare Video Flow Fails

Check:

- the creator account has the correct role and linked profile
- Cloudflare Stream environment variables exist in the current environment
- allowed origins include the active Preview or Production domain
- the save route receives the expected Cloudflare UID

## Session Or Login Looks Stale

Clear the `resurgence_admin_session` cookie for the local or hosted domain, then sign in again.
