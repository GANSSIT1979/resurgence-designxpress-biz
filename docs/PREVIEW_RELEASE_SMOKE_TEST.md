# Preview Release Smoke Test

Updated: 2026-04-23

## Purpose

Use this checklist to validate the current Phase 1 upgrade in **Vercel Preview** before any Production promotion.

This smoke test is specifically for the current release track:

- additive Prisma migration rollout
- Cloudflare Stream direct upload
- Prisma-backed creator post save flow
- feed playback and dashboard visibility
- auth stability across upgraded login flows

This document is intentionally narrow. It is not a full QA plan. It is the Preview release gate for the current deployment.

## Release Gate Summary

A Preview build is only considered promotion-ready when all of the following are true:

1. the additive Prisma migration has been applied to the Preview PostgreSQL database
2. the deployed Preview app is built from the same code revision the migration was reviewed against
3. auth flows succeed without regression
4. Cloudflare direct upload succeeds
5. the creator post save route persists a valid normalized post plus media asset
6. the uploaded post renders on creator surfaces, and on `/feed` or `/` once it reaches `PUBLISHED`
7. creator and member surfaces show the saved post or degrade safely without schema failures
8. no missing-table, missing-column, or pool-timeout bursts appear during normal testing

If any critical check fails, do **not** promote the build.

## Scope Under Test

### In Scope

- `/login`
- Google auth entry flow if configured
- mobile OTP request/verify flow if configured
- `/creator/posts/new`
- `src/app/api/media/cloudflare/direct-upload/route.ts`
- `src/app/api/creator/posts/create/route.ts`
- `/feed`
- `/`
- `/creators/[slug]`
- `/creator/dashboard`
- `/creator/posts`
- `/api/health`
- member/dashboard feed cards that consume the same normalized feed model

### Out Of Scope

- unrelated checkout rewrites
- sponsor workflow rewrites
- large inbox or messaging architecture changes
- broad analytics expansion beyond current feed/media needs

## Required Preconditions

Before starting the smoke test, confirm all items below.

### Database And Migration

- [ ] Preview PostgreSQL is reachable
- [ ] the reviewed migration has been generated locally
- [ ] migration SQL was reviewed before deployment
- [ ] the exact migration has been applied to Preview PostgreSQL
- [ ] Prisma Client is generated against the updated schema
- [ ] the app build and database schema are aligned

### Environment Variables

- [ ] `DATABASE_URL` is present in Vercel Preview
- [ ] `PRISMA_DB_PROVIDER=postgresql` is correct for Preview
- [ ] `CLOUDFLARE_ACCOUNT_ID` is present
- [ ] `CLOUDFLARE_STREAM_TOKEN` is present
- [ ] `CLOUDFLARE_STREAM_CUSTOMER_CODE` is present
- [ ] `CLOUDFLARE_STREAM_ALLOWED_ORIGINS` is set for the Preview domain if used
- [ ] `CLOUDFLARE_STREAM_MAX_DURATION_SECONDS` is set if the route expects it
- [ ] `CLOUDFLARE_REQUIRE_SIGNED_URLS=false` for the current feed rollout
- [ ] auth and session secrets are present and consistent with Preview requirements
- [ ] Google auth credentials are present if Google login is enabled
- [ ] OTP provider credentials are present if OTP is enabled

### Accounts And Test Data

Prepare at least these test identities.

- [ ] one creator-capable account with a linked `CreatorProfile`
- [ ] one member account
- [ ] one admin or staff account if feed publish or moderation checks are included
- [ ] one test video file under current upload limits
- [ ] one fallback test record with incomplete optional media metadata if possible

Recommended media sample:

- MP4
- short duration
- portrait-oriented sample for feed verification
- file name with normal characters only

## Test Evidence Rules

For each section below, collect:

- tester name
- Preview deployment URL
- git commit or branch identifier
- test timestamp
- pass or fail result
- screenshots for UI checks
- copied response payloads or error messages for failed API checks

If an item fails, record:

- route or API endpoint
- exact observed behavior
- expected behavior
- error message text
- whether the issue is blocking Production promotion

## Section 1: Preview Health And Build Sanity

### Goal

Confirm the Preview deployment is reachable and not failing immediately on migrated routes.

### Steps

1. Open the Vercel Preview deployment URL.
2. Load `/`.
3. Load `/feed`.
4. Load `/creators/[slug]` for a creator with published media history.
5. Load `/login`.
6. Load `/creator/dashboard` while signed out and observe expected access handling.
7. Load `/creator/posts/new` while signed out and observe expected access handling.
8. Load `/api/health` and confirm the schema probe reflects additive column drift accurately.

### Pass Criteria

- [ ] Preview loads successfully
- [ ] no application boot failure is visible
- [ ] no obvious hydration or fatal runtime error blocks page rendering
- [ ] routes respond with expected auth handling instead of server crashes

### Blockers

- missing table errors
- missing additive column errors such as `ContentPost.title`
- missing column errors
- fatal route handler errors
- build mismatch behavior after migration

## Section 2: Auth Flow Smoke Test

### Goal

Confirm the upgraded auth experience still works after schema and feed changes.

### A. Password Login

1. Open `/login`.
2. Sign in with a valid creator account.
3. Confirm redirect lands on the expected role destination.
4. Open `/creator/posts/new`.

Pass:

- [ ] login form renders correctly
- [ ] credentials are accepted
- [ ] session is created
- [ ] role redirect works
- [ ] no infinite redirect or session loop occurs

### B. Google Login

Only run if enabled in Preview.

1. Click Google login.
2. Complete OAuth flow.
3. Confirm the user returns to the app successfully.

Pass:

- [ ] Google auth completes
- [ ] user lands in the correct signed-in state
- [ ] no callback or token exchange error occurs

### C. Mobile OTP Login Or Signup

Only run if enabled in Preview.

1. Request OTP.
2. Submit valid OTP.
3. Confirm session creation or signup completion.

Pass:

- [ ] OTP request succeeds
- [ ] cooldown and resend behavior are sane
- [ ] OTP verification succeeds
- [ ] signed-in state is established

### D. Basic Session Persistence

1. Refresh the signed-in page.
2. Open a protected route in a new tab.
3. Sign out if sign-out is available.

Pass:

- [ ] session persists correctly
- [ ] protected routes remain accessible when expected
- [ ] sign-out clears the session cleanly

## Section 3: Creator Upload Flow

### Goal

Confirm Cloudflare Stream direct upload works from the Preview deployment.

### Steps

1. Sign in as a creator-capable account.
2. Open `/creator/posts/new`.
3. Select the test MP4 file.
4. Start upload using `CloudflareDirectUploadForm`.
5. Wait for upload completion.

### Expected Result

The frontend should receive a valid response from `src/app/api/media/cloudflare/direct-upload/route.ts`, upload directly to Cloudflare, and surface a usable Cloudflare Stream UID in the success state.

### Pass Criteria

- [ ] upload form renders
- [ ] upload begins successfully
- [ ] direct upload URL is issued by the server route
- [ ] file uploads to Cloudflare successfully
- [ ] UI displays success state
- [ ] the returned payload includes a usable Cloudflare video ID
- [ ] no CORS or allowed-origin issue occurs

### Fail Examples

- `401` or `403` from the upload route because the session or role gate failed
- `500` from the upload route because required env vars are missing
- Cloudflare rejection because of bad origin configuration
- upload stalls without UI recovery

## Section 4: Prisma Save Flow

### Goal

Confirm the creator post save route persists the uploaded post after Cloudflare upload.

### Steps

1. After a successful upload, complete title, caption, hashtags, and visibility fields.
2. Save as draft or submit for review through `src/app/api/creator/posts/create/route.ts`.
3. Inspect the client success response.
4. If needed, verify the saved row directly in the database.

### Expected Stored Shape

For this repo, confirm the saved data matches the normalized model, not a flat legacy content schema.

- `ContentPost.creatorProfileId`
- `ContentPost.title` where provided
- `ContentPost.caption`
- `ContentPost.slug` if generated
- `ContentPost.status`
- `ContentPost.visibility`
- `MediaAsset.mediaType = VIDEO`
- `MediaAsset.storageProvider = cloudflare-stream`
- `MediaAsset.storageKey = <cloudflare uid>`
- `MediaAsset.metadataJson.cloudflareVideoId` or equivalent metadata where present
- timestamps on both post and media rows

### Pass Criteria

- [ ] create route returns success
- [ ] returned post identifier is valid
- [ ] the Cloudflare video ID is persisted through the media asset path
- [ ] saved post can be queried back from the app read path
- [ ] no Prisma delegate or model mismatch occurs
- [ ] no schema drift error occurs

### Blocking Errors

- missing `ContentPost` table
- missing expected `MediaAsset` or post columns
- server route succeeds partially but the post is not actually persisted
- type or shape mismatch between upload response and save payload

## Section 5: Feed Playback Verification

### Goal

Confirm Cloudflare-backed posts render correctly in feed surfaces once they are actually public.

### Important Repo Note

In the current repo, creator-authored saves do not automatically become public feed items. A creator save normally results in `DRAFT` or `PENDING_REVIEW`. Do not expect the post to appear on `/feed` or `/` until it is in `PUBLISHED` status with `PUBLIC` visibility.

Use one of these paths before running public feed playback checks:

- publish the saved post through the existing admin or staff moderation flow if available
- use an elevated account that is allowed to create a published feed post for Preview testing
- perform a controlled database-side status update only if that is part of your release process

### Steps

1. Open `/feed`.
2. Look for the newly published test post.
3. Confirm the post renders in the expected card or feed layout.
4. Play the video.
5. If homepage includes feed content for the published record, repeat on `/`.

### Pass Criteria

- [ ] published test post appears on `/feed`
- [ ] title and caption metadata are visible where expected
- [ ] Cloudflare Stream playback works
- [ ] portrait media displays acceptably in the feed layout
- [ ] no broken iframe or invalid player source appears
- [ ] fallback behavior remains stable for posts without video

### Check Rendering Details

- [ ] feed card spacing is stable
- [ ] action rail or feed controls do not overlap critical media content
- [ ] metadata overlays render without layout collapse
- [ ] page remains responsive on a mobile-width viewport

## Section 6: Creator Dashboard And Workspace Verification

### Goal

Confirm creators can see the saved post after save and that workspace surfaces remain stable.

### Steps

1. Open `/creator/dashboard`.
2. Open `/creator/posts`.
3. Open `/creator/posts/new`.
4. Confirm the newly created content is visible or queryable.
5. Confirm status labels are sane for draft or pending-review behavior.

### Pass Criteria

- [ ] dashboard loads without Prisma or query failures
- [ ] recent-post area shows the uploaded content if implemented
- [ ] creator workspace routes do not fail after schema rollout
- [ ] draft or review indicators match the submitted state

### Watch For

- duplicated query load
- empty-widget crashes
- notification joins failing because of unrelated schema mismatch

## Section 7: Member And Fallback Behavior

### Goal

Make sure the migrated feed and data path do not break lighter user journeys.

### Steps

1. Sign in as a member account.
2. Open `/member`.
3. Open `/feed`.
4. Verify behavior when some cards or notifications are missing.

### Pass Criteria

- [ ] member dashboard still renders
- [ ] missing notifications do not crash the page
- [ ] feed still renders when some optional content is absent
- [ ] empty states display instead of server errors

## Section 8: Performance And Stability Checks

### Goal

Spot obvious Preview instability before Production promotion.

### Observe During Normal Testing

- [ ] no repeated `500` responses during page load
- [ ] no rapid PostgreSQL connection-pool timeout bursts
- [ ] no repeated auth redirect loops
- [ ] no repeated Cloudflare upload token failures
- [ ] no severe client console spam indicating hidden data-shape issues

### Specific Errors To Watch For

- `relation does not exist`
- `column does not exist`
- `The column ContentPost.title does not exist in the current database`
- Prisma connection pool timeout errors
- unauthorized upload route access because of incorrect session gating
- invalid origin or CORS failures from Cloudflare Stream

## Section 9: Database Verification Queries

Run equivalent checks against Preview PostgreSQL if direct DB verification is part of the release process.

Use names adjusted to your actual schema.

### A. Confirm Tables Exist

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('ContentPost', 'MediaAsset');
```

### B. Confirm Expected Post Columns

```sql
SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'ContentPost'
ORDER BY ordinal_position;
```

### C. Confirm Recent Saved Posts With Media

```sql
SELECT
  p.id,
  p."creatorProfileId",
  p.title,
  p.caption,
  p.slug,
  p.status,
  p.visibility,
  p."createdAt",
  m."mediaType",
  m."storageProvider",
  m."storageKey"
FROM "ContentPost" p
LEFT JOIN "MediaAsset" m
  ON m."postId" = p.id
ORDER BY p."createdAt" DESC
LIMIT 10;
```

### D. Confirm Cloudflare-Backed Media Assets Exist

```sql
SELECT
  m.id,
  m."postId",
  m."storageProvider",
  m."storageKey",
  m."mediaType",
  m."createdAt"
FROM "MediaAsset" m
WHERE m."storageProvider" = 'cloudflare-stream'
  AND m."storageKey" IS NOT NULL
ORDER BY m."createdAt" DESC
LIMIT 10;
```

## Section 10: Pass Or Fail Decision

### Promotion To Production Is Allowed Only If:

- [ ] all critical auth tests pass
- [ ] Cloudflare direct upload passes
- [ ] Prisma save passes
- [ ] public feed playback passes after the post is actually published
- [ ] `/creators/[slug]` passes without content-post schema drift errors
- [ ] creator dashboard and workspace surfaces pass
- [ ] no blocking schema drift errors remain
- [ ] no blocking pool-timeout or stability issue is observed
- [ ] the tested Preview deployment corresponds to the reviewed migration and app revision

### Production Promotion Is Blocked If Any Of The Following Occur:

- [ ] missing table or missing column error appears anywhere in the tested flow
- [ ] upload works but save fails
- [ ] save works but creator or public feed playback fails
- [ ] auth regressions prevent normal creator flow
- [ ] Preview uses a different schema state than the reviewed migration
- [ ] role gating is broken on upload or save routes

## Failure Triage Template

Use this format for each failing item.

### Issue Title

### Environment

- Preview URL:
- commit:
- tester:
- timestamp:

### Route Or Endpoint

### Steps To Reproduce

1.
2.
3.

### Expected

### Actual

### Error Message

### Severity

- blocker / major / minor

### Suspected Layer

- migration / Prisma / auth / Cloudflare / feed mapping / UI

### Action Owner

## Sign-Off

### Technical Sign-Off

- [ ] migration reviewed
- [ ] migration applied to Preview
- [ ] Preview app verified against migrated schema
- [ ] no blockers remain

Name:
Date:

### Product Sign-Off

- [ ] visible creator workflow is acceptable for Phase 1
- [ ] feed playback experience is acceptable for Preview promotion
- [ ] dashboard regressions are not present or are explicitly waived

Name:
Date:

## Immediate Follow-On If Preview Passes

1. promote the exact reviewed migration to Production
2. deploy the matching app revision to Production
3. rerun a reduced Production smoke test:
   - `/login`
   - `/creator/posts/new`
   - upload
   - save
   - `/feed` playback
4. monitor logs for schema drift or connection-pool issues

## Immediate Follow-On If Preview Fails

1. stop promotion
2. identify whether the failure is migration, env, auth, route, or feed-mapping related
3. fix the issue in branch
4. redeploy Preview
5. rerun this smoke test from the failed section forward, and rerun the final pass or fail decision
