# Vercel Deployment Checklist

Updated: 2026-04-23
## Purpose

This checklist is tailored to the current RESURGENCE Powered by DesignXpress application and its active upgrade path:

- `Next.js 15` App Router
- route handlers under `src/app/api`
- Prisma-backed relational data
- creator-commerce feed on `/` and `/feed`
- auth flows for password login, Google sign-in/signup, mobile OTP signup, and mobile OTP login
- protected dashboards for admin, member, creator, sponsor, staff, cashier, coach, referee, and partner
- serverless-safe upload delivery through `/api/uploads/image/[id]` or `/api/uploads/r2/[...key]`

This document is written for Vercel production deployment, not local development.

## Current Repo Anchors

These files and scripts are part of the live deployment surface and should be checked before every rollout:

- `vercel.json`
- `vercel.production.env.example`
- `package.json`
- `scripts/prepare-prisma-schema.mjs`
- `scripts/push-prisma-schema.mjs`
- `src/lib/auth.ts`
- `src/app/api/auth/google/route.ts`
- `src/app/api/auth/mobile/request-otp/route.ts`
- `src/app/api/auth/mobile/verify-otp/route.ts`
- `src/app/api/auth/mobile/login/request-otp/route.ts`
- `src/app/api/auth/mobile/login/verify-otp/route.ts`

## 1. Deployment Assumptions To Lock In

Confirm these platform assumptions before every production rollout:

- Production runtime is `Vercel`.
- App framework remains `Next.js 15` App Router.
- Production database is `PostgreSQL`, not SQLite.
- Prisma schema is synchronized before traffic reaches new UI code.
- Persistent media is not stored in local filesystem paths such as `public/uploads`.
- Public media is served by one of these production-safe layers:
  - external hosted video such as Cloudflare Stream or other embed-safe providers
  - `/api/uploads/image/[id]` for database-backed image delivery
  - `/api/uploads/r2/[...key]` for R2/object storage delivery

## 2. Environment Variables

### Required

Confirm these are present in the correct Vercel environment scopes:

- `DATABASE_URL`
- `PRISMA_DB_PROVIDER=postgresql`
- `JWT_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `FORCE_HTTPS=true`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_ID`

### Required When The Related Feature Is Enabled

- `OTP_DELIVERY_MODE`
- `SMS_WEBHOOK_URL`
- `SMS_WEBHOOK_SECRET`
- `EMAIL_WEBHOOK_URL`
- `EMAIL_WEBHOOK_SECRET`
- `OPENAI_API_KEY`
- `OPENAI_WORKFLOW_ID`
- `OPENAI_WORKFLOW_VERSION`
- `OPENAI_WEBHOOK_SECRET`
- `OPENAI_DEFAULT_MODEL`
- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- `R2_PUBLIC_BASE_URL`

### Environment Scope Check

Set and verify values in all environments you actively use:

- local development
- Vercel Preview
- Vercel Production

Do not assume Preview and Production share identical values.

Use these checked-in helpers as the baseline:

- `vercel.production.env.example`
- `docs/VERCEL.md`

## 3. Database Readiness Before Deployment

This remains the highest-risk release area in the current project.

### Pre-Deploy Schema Checklist

Before promoting a new commit to production:

1. run `npm run prisma:prepare`
2. run `npm run prisma:generate`
3. decide which schema deployment path you are using
4. apply schema changes to the target PostgreSQL database before Vercel serves the new code
5. smoke test routes that query the new schema

### Important Repo Reality

This repository currently exposes two database release paths:

- `npm run db:deploy`
  - runs `scripts/push-prisma-schema.mjs`
  - uses `prisma db push` plus checked-in PostgreSQL SQL hardening scripts
- `npm run db:migrate:deploy`
  - runs Prisma migration deployment against `prisma/schema.generated.prisma`

Do not mix these casually in one release. Pick the intended path and run it deliberately.

### Historical Drift Symptoms To Treat As Release Blockers

Examples already seen during real rollout checks and April 23, 2026 production log exports include:

- `The column ContentPost.title does not exist in the current database`
- homepage `/` falling back to the gallery feed after a `prisma.contentPost.findMany()` failure
- `/creators/[slug]` throwing Prisma `P2022` because additive `ContentPost` columns were deployed in code before PostgreSQL was updated
- `PlatformNotification.actorUserId does not exist`

Any missing-table or missing-column error means application code reached Vercel before the target database matched the expected schema.

### Safe Release Order

For the current repo, the safe sequence is:

1. merge code
2. run `npm run prisma:prepare`
3. run `npm run prisma:generate`
4. apply schema changes to Preview database
5. validate Preview deployment
6. apply schema changes to Production database
7. promote Production deployment
8. run post-deploy smoke tests

If Preview and Production use different PostgreSQL databases, repeat the schema step for each target.

## 4. Build And Prisma Execution Flow

### Recommended Build Checks

Make sure the release path confirms all of these:

- Prisma client generation succeeds
- the prepared schema reflects PostgreSQL
- route handlers compile without Edge/runtime conflicts
- the app does not depend on durable local filesystem writes

### Recommended Deployment Sequence

The practical repo-aligned sequence is:

1. install dependencies with `npm install`
2. run `npm run prisma:prepare`
3. run `npm run prisma:generate`
4. apply schema changes with `npm run db:deploy` or `npm run db:migrate:deploy`
5. run `npm run build`
6. deploy to Vercel

`npm run build` already runs `npm run prisma:generate`, but that does not replace actual database deployment.

## 5. Storage And Media Checklist

### Do Not Rely On Local Disk On Vercel

Avoid treating these as durable production storage:

- `public/uploads`
- temporary filesystem writes inside route handlers
- any generated media path that must survive across invocations

### Production-Safe Media Plan

Use this split:

- video: hosted video embeds or a durable provider such as Cloudflare Stream
- images/assets: database-backed upload records or R2/object storage
- cart state: browser local storage is acceptable for the current merch cart design

### Feed And Media Rollout Check

Before releasing a new feed card, creator page, or merch surface:

- confirm every media source resolves in Preview
- confirm fallback media or empty states exist
- confirm the UI does not crash when video is absent
- confirm tagged product deep links still resolve to `/shop/product/[slug]`

## 6. Route-By-Route Smoke Test List

After every Preview and Production deployment, manually test at least these:

### Public Routes

- `/`
- `/feed`
- `/creators`
- `/creator/[slug]`
- `/creators/[slug]`
- `/shop`
- `/shop/product/[slug]`
- `/cart`
- `/checkout`
- `/account/orders`
- `/support`
- `/login`

### Protected Routes

- `/member`
- `/creator/dashboard`
- `/creator/posts`
- `/admin`
- `/cashier`
- `/staff`
- `/partner`
- `/sponsor/dashboard`

### Flow Tests

- password login
- Google sign-in/signup
- mobile OTP signup request and verification
- mobile OTP login request and verification
- follow, like, save, and comment actions
- product-tag to product-page flow
- cart add, update, and remove
- checkout creation
- support widget session and message flow
- role redirect after auth

### Health Endpoints

- `/api/health`
- `/api/auth/me`

The health probe should verify additive content-post columns such as `title` and `slug`, Cloudflare-related media columns such as `originalFileName` and `storageKey`, and notification actor columns such as `actorUserId`.

## 7. Serverless And Runtime Checks

### Keep Route Handlers Serverless-Safe

Review route handlers for:

- long-running blocking work
- assumptions about writable local disk
- assumptions about in-memory state persistence across requests
- oversized payload handling without safe limits

### Keep Client And Server Boundaries Clean

For the current TikTok-style upgrade:

- keep server components as the default
- use client components only where interactivity is required
- keep heavy media lazy-loaded
- avoid turning full pages into client components without a clear reason

## 8. Auth And Session Checks

Before each release:

- confirm the `resurgence_admin_session` cookie is set and cleared correctly
- verify middleware still protects role-restricted routes
- confirm role redirect mapping still sends users to the correct dashboard after login or signup
- confirm auth flows work on both desktop and mobile browsers
- confirm OTP expiration and error states remain user-friendly

### Vercel-Specific Auth Reliability

- confirm cookie behavior under HTTPS
- confirm secure-cookie behavior in production
- verify Google Identity Services configuration matches the active production and preview origins
- verify `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID` are aligned
- verify OTP delivery mode and webhook credentials are correct per environment

Note:

- the current Google flow verifies the ID token audience server-side in `/api/auth/google`
- this app does not rely on a traditional OAuth callback route for the current Google sign-in UX

## 9. Observability And Rollback Readiness

### Monitor Immediately After Deploy

Watch for:

- Prisma errors
- missing table or missing column errors
- upload or media delivery failures
- Google sign-in failures
- OTP delivery or verification failures
- dashboard 500s
- support flow failures

### Keep Rollback Simple

Before large UI changes:

- keep deploys small and route-focused
- release Phase 1 incrementally
- avoid combining schema, feed, auth, and dashboard rewrites in one large production push when possible
- keep feed and dashboard fallback states in place

## 10. Phase 1 Rollout Order

Release Phase 1 in this sequence:

1. shared primitives and app shell
2. `/login` refresh
3. homepage `/` feed preview refresh
4. `/feed` flagship viewport upgrade
5. `/member` dashboard refresh
6. `/creators/[slug]` creator profile refresh

At each step:

- deploy to Preview
- verify schema compatibility
- verify auth compatibility
- test mobile first
- test desktop fallback
- then promote to Production

## 11. Pre-Launch Go / No-Go Checklist

Do not promote the deployment unless all are true:

- PostgreSQL is active in the target hosted environment
- Prisma schema changes are applied before the app code goes live
- no missing table or missing column errors remain
- media delivery works without local filesystem dependency
- password login, Google auth, and mobile OTP all pass smoke tests
- `/feed`, `/member`, and `/creator/dashboard` load cleanly
- support widget flow works end-to-end
- cart and checkout complete successfully
- rollback path is known

## 12. Post-Launch Acceptance Checklist

A deployment is considered healthy when:

- homepage feed loads without schema fallback errors
- creator dashboard loads without notification or post query failures
- member dashboard loads successfully
- images and video render correctly on Vercel
- auth redirect and protected route behavior remain intact
- core engagement actions continue to work
- no new serverless storage issues appear in logs

## 13. Related Artifact

The next rollout-planning document after this checklist is:

- `docs/PHASE1_ROUTE_INTEGRATION_PLAN.md`

Use that document to map the Phase 1 component layer into the actual route files and data loaders already active in this repository.
