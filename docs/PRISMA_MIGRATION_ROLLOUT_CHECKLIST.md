# Prisma Migration Rollout Checklist

Updated: 2026-04-24
## Purpose

This checklist is for rolling out the current Prisma content-post schema safely on **Vercel Preview** and **Vercel Production** for the existing Resurgence DX app.

For the route-by-route Preview validation pass after the migration lands, also use [PREVIEW_RELEASE_SMOKE_TEST.md](./PREVIEW_RELEASE_SMOKE_TEST.md).

It is written for the live architecture in this repo:

- Next.js 15 App Router
- route handlers under `src/app/api`
- Prisma-backed relational persistence
- hosted PostgreSQL in production
- local SQLite fallback only for development
- serverless-safe media delivery instead of persistent local disk
- provider-switched Prisma preparation through `scripts/prepare-prisma-schema.mjs`

It also assumes the current Cloudflare Stream upload and save flow:

- `src/app/api/media/cloudflare/direct-upload/route.ts`
- `src/app/api/creator/posts/create/route.ts`
- feed reads on `/` and `/feed`

## 1. What This Rollout Is Protecting Against

This rollout is designed to prevent the same schema drift already seen in deployed environments:

- homepage/feed code queried additive `ContentPost` columns such as `title` before the database matched the app code
- creator profile code on `/creators/[slug]` queried creator-linked `ContentPost` rows before PostgreSQL had the same additive columns
- creator/admin notifications queried `PlatformNotification.actorUserId` before that column existed
- hosted PostgreSQL also showed connection pool timeout symptoms during request handling

The rule is:

1. schema reaches the target database first
2. matching application code reaches traffic second

## 2. Scope Of The Current Migration

For this release, confirm the schema scope is limited to the current normalized creator-feed model.

### Required for this release

- additive `ContentPost` fields:
  - `title`
  - `slug`
- additive `MediaAsset` field:
  - `originalFileName`
- feed/media indexes:
  - `MediaAsset.storageKey`
  - `MediaAsset.storageProvider + storageKey`
- any intentionally bundled notification-column fixes such as `PlatformNotification.actorUserId`
- route and serializer alignment for:
  - `/api/creator/posts/create`
  - feed mutations
  - feed serializers

### Not required unless already intentionally bundled

- a second flat `ContentPost` table
- duplicate feed enums
- analytics tables
- watch-time metrics
- topic mapping tables
- moderation workflow redesign
- unrelated dashboard schema changes

Keep the migration as small as possible.

## 3. Preflight Before Generating The Migration

### A. Freeze the schema target

Confirm `prisma/schema.prisma` is final for this release.

- no duplicate `ContentPost`-like models
- no duplicate enums
- `ContentPost` remains the existing normalized post table
- Cloudflare-specific persistence stays on `MediaAsset` where appropriate
- existing `Hashtag` / `PostHashtag` relations stay intact

### B. Freeze the code target

Confirm the code depending on this schema is limited to:

- `src/app/api/creator/posts/create/route.ts`
- `src/app/api/media/cloudflare/direct-upload/route.ts`
- `src/lib/feed/mutations.ts`
- `src/lib/feed/serializers.ts`
- `src/lib/feed/types.ts`
- `src/lib/feed/validation.ts`
- pages and loaders already reading `prisma.contentPost`

Do not mix this release with large auth rewrites, checkout rewrites, or unrelated dashboard redesigns.

### C. Freeze the environment target

Confirm you know which databases map to:

- local development
- Vercel Preview
- Vercel Production

Do not assume Preview and Production point at the same PostgreSQL instance.

## 4. Local Dry Run Checklist

Run the migration locally before touching Vercel.

### Local commands

```bash
npx prisma format
npx prisma validate --schema prisma/schema.prisma
npm run prisma:generate
npm run db:migrate -- --name add-contentpost-phase1
```

Equivalent direct Prisma form if needed:

```bash
npm run prisma:prepare
prisma migrate dev --schema prisma/schema.generated.prisma --name add-contentpost-phase1
```

### After local migration succeeds

Check all of the following:

- Prisma Client generates without type errors
- the local database has the new additive `ContentPost` and `MediaAsset` columns
- the app boots without Prisma initialization errors
- `/` and `/feed` no longer fail because of schema mismatch
- `POST /api/creator/posts/create` can save a row tied to a Cloudflare video UID

### Local smoke test payload

```json
{
  "creatorId": "test_creator_profile_id",
  "cloudflareVideoId": "sample_cloudflare_uid",
  "title": "Phase 1 test post",
  "caption": "Testing Cloudflare Stream save flow",
  "status": "DRAFT",
  "visibility": "PUBLIC",
  "hashtags": ["phase1", "stream"],
  "originalFileName": "demo.mp4"
}
```

## 5. Migration Review Before Commit

Before committing the migration, inspect the generated SQL carefully.

### Verify the migration does exactly what you expect

Look for these patterns:

- alters the existing `ContentPost` table safely
- alters the existing `MediaAsset` table safely
- creates only the expected indexes
- adds any intentionally included notification columns
- does **not** create a duplicate posts table
- does **not** recreate a populated live table unnecessarily
- does **not** rewrite unrelated relations

### Watch for dangerous surprises

Stop and revise if the migration would:

- drop production data
- recreate `ContentPost` instead of altering it safely
- duplicate a content table under another name
- add constraints existing rows cannot satisfy
- add a required column to a populated table without a default or backfill path

## 6. Git Commit Contents For This Release

The safest commit for this rollout should contain only the minimum set of files.

### Include

- merged `prisma/schema.prisma`
- generated migration folder under `prisma/migrations/...`
- `src/app/api/creator/posts/create/route.ts`
- `src/app/api/media/cloudflare/direct-upload/route.ts` if it changed in the same release
- feed mutation and serializer files that use the new columns
- small fallback-safe UI changes needed for the new data path

### Avoid including in the same deploy

- unrelated auth rewrites
- large dashboard redesigns
- checkout rewrites
- sponsor workflow rewrites
- broad environment refactors

## 7. Preview Database Rollout

Apply schema to Preview **before** trusting the Preview deployment.

### Preview sequence

1. Push the migration commit to the Preview branch.
2. Confirm Preview environment variables are correct.
3. Run `npm run db:migrate:deploy` against the **Preview** database.
4. Deploy the Preview build.
5. Run Preview smoke tests.

### Preview environment checks

Confirm at minimum:

- `DATABASE_URL`
- `PRISMA_DB_PROVIDER=postgresql`
- session/auth secrets
- Google auth variables if applicable
- OTP provider variables if applicable
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_STREAM_TOKEN`
- `CLOUDFLARE_STREAM_CUSTOMER_CODE`
- `CLOUDFLARE_STREAM_ALLOWED_ORIGINS`
- `CLOUDFLARE_STREAM_MAX_DURATION_SECONDS`
- `CLOUDFLARE_REQUIRE_SIGNED_URLS`

Accuracy note:

- `DATABASE_URL` is the only Prisma connection variable the current app and checked-in schemas read directly
- `POSTGRES_URL*` helper variables are optional operational aliases and should not be treated as substitutes for `DATABASE_URL`

### Preview smoke tests

Run these before promoting anything:

- load `/`
- load `/feed`
- load `/creator/dashboard`
- create a direct upload URL
- upload one test video to Cloudflare Stream
- save one creator post with `cloudflareVideoId`
- reload `/feed` and confirm the new post resolves without schema errors
- verify notification-related screens do not crash on missing columns

### Preview log checks

Confirm these error patterns are gone:

- `The column ContentPost.title does not exist in the current database`
- homepage feed fallback logs caused by `prisma.contentPost.findMany()` schema drift
- `/creators/[slug]` Prisma `P2022` errors during creator-channel post reads
- missing `PlatformNotification.actorUserId` column errors if that column was bundled
- repeated Prisma pool timeout bursts during normal page load

If any of those still appear, do not promote.

## 8. Production Database Rollout

Only proceed after Preview is clean.

### Production sequence

1. Ensure the exact migration already proved clean in Preview.
2. Back up the Production database or confirm a managed backup snapshot exists.
3. Run `npm run db:migrate:deploy` against the **Production** database.
4. Verify the migration completes successfully.
5. Deploy or promote the matching application build.
6. Run Production smoke tests immediately.

### Production smoke tests

Run these right after deploy:

- `/`
- `/feed`
- `/creator/dashboard`
- `/member`
- login flow
- Google auth flow if active
- mobile OTP flow if active
- direct upload URL creation
- save route for creator posts
- at least one feed playback test using a real Cloudflare video UID

### Production go/no-go rule

Do not route user traffic to new code until both are true:

- migration has succeeded in the Production database
- the deployment using that schema has passed smoke tests

## 9. Recommended Command Sequence

Use this as the release cheat sheet.

### Local preparation

```bash
npx prisma format
npx prisma validate --schema prisma/schema.prisma
npm run prisma:generate
npm run db:migrate -- --name add-contentpost-phase1
npm run build
```

### Preview deployment preparation

```bash
# point DATABASE_URL to Preview database
npm run db:migrate:deploy
npm run prisma:generate
npm run build
```

### Production deployment preparation

```bash
# point DATABASE_URL to Production database
npm run db:migrate:deploy
npm run prisma:generate
npm run build
```

Notes:

- `npm run prisma:generate` updates the client; it does **not** apply schema changes
- `npm run db:migrate:deploy` applies already-created migrations; it does **not** create new ones
- `npm run db:deploy` is this repo's `db push` style path and should not replace reviewed migrations for this rollout
- create migrations in development, review them, then deploy them unchanged

## 10. SQL And Data Verification Checklist

After applying the migration, verify the database shape directly.

### Verify table exists

```sql
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name = 'ContentPost';
```

### Verify expected `ContentPost` columns

```sql
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'ContentPost'
  and column_name in ('title', 'slug')
order by ordinal_position;
```

### Verify expected `MediaAsset` columns

```sql
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'MediaAsset'
  and column_name in ('originalFileName', 'storageKey', 'storageProvider');
```

### Verify notification column if included in this release

```sql
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'PlatformNotification'
  and column_name = 'actorUserId';
```

### Verify indexes

```sql
select tablename, indexname, indexdef
from pg_indexes
where schemaname = 'public'
  and tablename in ('ContentPost', 'MediaAsset')
order by tablename, indexname;
```

### Verify test insert path through app code

Confirm at least one saved row exists with:

- `ContentPost.title` or `ContentPost.slug` populated as expected
- `MediaAsset.storageProvider = 'cloudflare-stream'`
- a non-null `MediaAsset.storageKey`
- expected `creatorProfileId`
- expected `status`
- expected `visibility`

## 11. Connection Pool And Serverless Safety Checks

Recent logs showed PostgreSQL connection pool timeout symptoms, so add these checks during rollout.

### Review Prisma usage

- avoid creating a fresh Prisma client per request in many files
- keep the shared singleton/client pattern already used by the repo
- avoid unnecessary parallel database calls during initial page render
- avoid calling expensive queries in both layout and page when one loader can do the work

### Review route behavior

- keep Cloudflare upload URL creation on server routes only
- do not write videos to local filesystem paths on Vercel
- keep large uploads direct-to-Cloudflare instead of proxying file bytes through the app server

### Monitor during Preview and Production

Watch logs for:

- `Unable to check out connection from the pool due to timeout`
- closed PostgreSQL connector errors
- repeated fallback-to-gallery or feed degradation logs caused by database failures

If pool timeouts continue even after schema drift is fixed, treat that as a separate release blocker.

## 12. Rollback Plan

Have rollback ready before Production rollout.

### Application rollback

If the migration is fine but the code deploy is bad:

- roll back the Vercel deployment to the previous stable build
- leave the newer schema in place if it is backward-compatible
- disable only the new routes or feature flags if needed

### Database rollback

If the migration itself is bad:

- stop promotion immediately
- restore from managed backup or snapshot if required
- do **not** improvise destructive SQL directly in Production unless already rehearsed
- create a corrective forward migration when possible instead of a panic manual edit

### Practical rule

Prefer **forward fixes** over destructive rollback when the schema change is additive and harmless to older code.

## 13. Post-Deploy Acceptance Checklist

The release is healthy only when all of these are true:

- `/` loads without additive `ContentPost` column errors such as missing `title`
- `/feed` loads without fallback caused by schema failure
- `/creators/[slug]` loads without creator-channel `ContentPost` query failures
- `/creator/dashboard` loads without `PlatformNotification.actorUserId` errors if that column was included
- creator post creation succeeds through the Prisma save route
- uploaded Cloudflare Stream videos can be saved and rendered back in the feed
- no critical auth regressions appear
- no pool timeout burst appears during normal smoke testing

## 14. Drift Prevention Rules Going Forward

Use these rules for every Prisma release after this one.

1. Merge schema first.
2. Generate migration in development.
3. Review migration SQL before commit.
4. Apply migration to Preview database before trusting Preview UI.
5. Smoke-test Preview.
6. Apply the exact same migration to Production database.
7. Promote matching application code only after database success.
8. Keep migrations small and route-focused.
9. Do not let new code query columns or tables that were not deployed yet.
10. Do not rely on local filesystem storage for production media on Vercel.

## 15. Release Log Template

Use this template for the rollout note.

```text
Release: ContentPost Phase 1
Date:
Commit SHA:
Migration name:
Preview DB migrated: yes/no
Preview smoke tests passed: yes/no
Production DB migrated: yes/no
Production smoke tests passed: yes/no
Rollback needed: yes/no
Notes:
- 
- 
- 
```

## Recommended Next Artifact

The clean next artifact after this checklist is either:

- `CONTENTPOST_PRISMA_MIGRATION_REVIEW.md` with SQL review notes, or
- `POST_DEPLOY_SMOKE_TEST_SCRIPT.md` with copy-paste checks for `/`, `/feed`, `/creator/dashboard`, upload, save, and playback
