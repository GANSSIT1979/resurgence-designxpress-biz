# DEPLOYMENT

Updated: 2026-04-23
For schema-first Preview and Production rollout of the current creator-feed migration, also use [PRISMA_MIGRATION_ROLLOUT_CHECKLIST.md](./PRISMA_MIGRATION_ROLLOUT_CHECKLIST.md).

For the narrow Preview release gate covering auth, upload, save, feed playback, and creator surfaces, also use [PREVIEW_RELEASE_SMOKE_TEST.md](./PREVIEW_RELEASE_SMOKE_TEST.md).

## Site Type

- this is a `React/Node` deployment target built on `Next.js`
- production hosting must support the Next.js server/runtime model
- WordPress hosting, Laravel/PHP-only hosting, or static-only hosting are not valid deployment targets

## Supported Targets

- Vercel
- Railway
- Render
- Docker
- VPS or custom Node hosting

## Production Basics

Required production steps:

1. set production environment variables
2. point the database to PostgreSQL
3. run `npm run prisma:prepare`
4. run `npm run prisma:generate`
5. apply schema changes with the intended rollout path
6. run `npm run build`
7. verify `/api/health`

## Environment Baseline

Required in this repo:

- `DATABASE_URL`
- `JWT_SECRET`

Strongly recommended for hosted builds:

- `PRISMA_DB_PROVIDER=postgresql`
- `NEXT_PUBLIC_SITE_URL`
- `FORCE_HTTPS=true`

Required only when the related feature is enabled:

- Google auth variables
- OTP delivery variables
- Cloudflare Stream variables
- OpenAI and email webhook settings

Optional platform helper variables:

- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_PASSWORD`

Unused in the current codebase:

- `SUPABASE_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`

Accuracy notes:

- `DATABASE_URL` is the live Prisma/runtime connection string for this repo
- `POSTGRES_URL*` helper variables do not replace `DATABASE_URL` unless you intentionally map one of them into it
- the current codebase does not use direct Supabase SDK secrets

See [CONFIGURATION.md](./CONFIGURATION.md).

## Important Prisma Deployment Note

The active deployment flow is generated-schema based, not direct-schema mutation during build.

The live path is:

- `npm run prisma:prepare`
- `scripts/prepare-prisma-schema.mjs`
- `prisma/schema.generated.prisma`

Important notes:

- `db:deploy` is the repo's push-style path
- `db:migrate` and `db:migrate:deploy` are the migration-first path
- additive feed and media fields should use reviewed migrations, not an accidental production `db push`

## Vercel

See [VERCEL.md](./VERCEL.md) for the exact Vercel setup and [VERCEL_DEPLOYMENT_CHECKLIST.md](./VERCEL_DEPLOYMENT_CHECKLIST.md) for the release gate.

Typical flow:

1. connect the repository to Vercel
2. configure Preview and Production environment variables separately
3. connect PostgreSQL
4. apply the reviewed schema change to Preview first
5. deploy Preview
6. smoke-test Preview
7. apply the same reviewed schema change to Production
8. promote the matching build

Important:

- Vercel provisions HTTPS automatically for configured domains
- do not rely on Vercel filesystem persistence for long-term uploads
- verify `/api/health` after deployment because it now probes additive content-post, media-asset, analytics-table, and notification drift

## Railway / Render

Typical flow:

1. connect the repository
2. provision PostgreSQL
3. set environment variables
4. run `npm run build`
5. run `npm run start`
6. apply schema changes before serving the matching app revision

Recommended:

- use platform-managed HTTPS or terminate TLS at a reverse proxy
- use Cloudflare Stream, database-backed uploads, or durable object storage for media

## Docker

Typical pattern:

- install dependencies
- run `npm run prisma:prepare`
- run `npm run prisma:generate`
- apply schema changes intentionally
- run `npm run build`
- start the production server with `npm run start`

Make sure:

- `DATABASE_URL` is injected correctly
- Prisma Client is generated against the prepared schema
- migrations are handled during release, not by first user traffic

## VPS Or Custom Node Hosting

Typical flow:

1. provision Node.js 20.x
2. provision PostgreSQL
3. copy environment variables to the host
4. run `npm install`
5. run `npm run prisma:prepare`
6. run `npm run prisma:generate`
7. apply schema changes
8. run `npm run build`
9. run `npm run start` behind a process manager or reverse proxy

For HTTPS on a VPS, terminate TLS at Caddy or Nginx and forward requests to the app on port `3000`.

## Release Checklist

- `npm run prisma:prepare` passes
- `npm run prisma:generate` passes
- the intended schema deployment path has been applied to the target database
- `npm run build` passes
- `GET /api/health` reflects a healthy or intentionally understood state
- login works
- `/feed` loads
- `/creators/[slug]` loads
- `/creator/dashboard` loads or degrades safely
- merch routes load
- support routes load

## Production Storage Guidance

Local:

- `public/uploads`
- `UPLOAD_STORAGE=filesystem`

Hosted environments:

- Cloudflare Stream for creator video upload and playback
- `UPLOAD_STORAGE=database` for database-backed image delivery
- `UPLOAD_STORAGE=r2` for durable R2-backed image delivery

## Post-Deployment Validation

Verify:

- `/`
- `/feed`
- `/creators/[slug]`
- `/login`
- `/member`
- `/creator/dashboard`
- `/creator/posts`
- `/shop`
- `/shop/product/[slug]`
- `/checkout`
- `/support`
- `/api/health`

## AI Support Production Notes

If you are enabling workflow-backed support:

1. set `OPENAI_API_KEY`
2. set `OPENAI_WORKFLOW_ID`
3. optionally set `OPENAI_WORKFLOW_VERSION`
4. set `OPENAI_WEBHOOK_SECRET`
5. run:

```bash
npm run support:verify -- --base-url=https://your-domain.example --webhook-secret=whsec_...
```
