# DEPLOYMENT

Updated: 2026-04-21

## Site Type

- This is a `React/Node` deployment target built on `Next.js`.
- Production hosting must support the Next.js server/runtime model.
- WordPress hosting, Laravel/PHP-only hosting, or static-only hosting are not valid deployment targets for this codebase.

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
5. run schema deployment with `npm run db:deploy`
6. build and start the app

As of 2026-04-19, the local production build is green.

## Environment Baseline

Required or commonly used variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `FORCE_HTTPS=true`
- `NEXT_PUBLIC_SITE_NAME`
- `PRISMA_DB_PROVIDER`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH` only if you want the fallback admin path enabled
- optional OpenAI keys and webhook settings
- optional email webhook settings

See [CONFIGURATION.md](./CONFIGURATION.md)

## Important Prisma Deployment Note

This project’s active deployment flow is provider-switched, not template-driven by default.

The live path is:

- `npm run prisma:prepare`
- `scripts/prepare-prisma-schema.mjs`
- `prisma/schema.prisma`

Legacy files such as `prisma/schema.template.prisma` and `scripts/prepare-prisma.mjs` still exist in the repo, but they are not the default path used by `package.json`.

Before build or migration commands, confirm:

- `PRISMA_DB_PROVIDER=postgresql`
- `npm run prisma:prepare` updates the datasource provider in `prisma/schema.prisma`
- `npm run prisma:generate` succeeds against the prepared schema

## Vercel

See [VERCEL.md](./VERCEL.md) for the exact Vercel project settings and environment variable checklist.

Typical flow:

1. push the repository to GitHub
2. import the project into Vercel
3. configure environment variables
4. connect a PostgreSQL database
5. run `npm run build` as the build command
6. run schema deployment separately with `PRISMA_DB_PROVIDER=postgresql npm run db:deploy`

Important:

- Vercel provisions and renews HTTPS certificates automatically for configured domains

- do not rely on Vercel’s filesystem for long-term uploads
- confirm the prepared Prisma schema reflects PostgreSQL before deployment
- verify `/api/health` after deployment

## Railway / Render

Typical flow:

1. connect the repository
2. provision PostgreSQL
3. set environment variables
4. run `npm run build`
5. run `npm run start`
6. run `npm run db:deploy` during release or pre-start orchestration

Recommended:

- use platform-managed HTTPS or terminate TLS at a reverse proxy before traffic reaches Next.js

- use `UPLOAD_STORAGE=database` or persistent object storage for uploaded media in production
- keep `public/uploads` only for local or temporary workflows unless persistent disk support exists

## Docker

Typical pattern:

- install dependencies
- run `npm run prisma:prepare`
- run `npm run prisma:generate`
- run `npm run build`
- run `npm run db:deploy`
- start the production server with `npm run start`

Make sure:

- `DATABASE_URL` is injected correctly
- Prisma Client is generated against the prepared schema
- migrations are handled intentionally during release, not implicitly by app traffic
- HTTPS is terminated by your ingress, load balancer, Caddy, Nginx, Traefik, or another TLS proxy

## VPS Or Custom Node Hosting

Typical flow:

1. provision Node.js 20.x
2. provision PostgreSQL
3. copy environment variables to the host
4. run `npm install`
5. run `npm run prisma:prepare`
6. run `npm run prisma:generate`
7. run `npm run db:deploy`
8. run `npm run build`
9. run `npm run start` behind a process manager or reverse proxy

For HTTPS on a VPS, terminate TLS at Caddy or Nginx and forward requests to the app on port `3000`. Set `FORCE_HTTPS=true` so direct HTTP requests are redirected to the HTTPS origin.

## Release Checklist

- `npm run prisma:prepare` passes
- `npm run prisma:generate` passes
- `npm run db:deploy` passes
- `npm run build` passes
- `GET /api/health` returns `ok`
- `NEXT_PUBLIC_SITE_URL` uses `https://`
- `FORCE_HTTPS=true` is set in production
- HTTP requests redirect to HTTPS
- login works
- admin dashboard loads
- admin users module loads
- cashier dashboard loads
- sponsor dashboard loads
- staff dashboard loads
- partner dashboard loads
- public creator profile pages load
- official merch storefront, product detail, cart, and checkout load
- admin official merch and merch orders modules load
- support page responds and degrades gracefully if OpenAI is disabled
- upload handling is either persistent or intentionally limited

## Production Storage Guidance

Local:

- `public/uploads`
- `UPLOAD_STORAGE=filesystem`

Production:

- Cloudflare R2: `UPLOAD_STORAGE=r2` stores uploaded images in the configured R2 bucket and returns either `R2_PUBLIC_BASE_URL/<key>` or the app proxy URL `/api/uploads/r2/<key>`
- Vercel/serverless: `UPLOAD_STORAGE=database` stores uploaded images in PostgreSQL and serves them through `/api/uploads/image/[id]`
- larger catalogs: prefer object storage such as S3-compatible storage, Cloudflare R2, or similar

## Post-Deployment Validation

Verify:

- homepage
- login
- protected routes
- contact and sponsor apply forms
- admin overview
- admin users
- cashier overview
- sponsor overview
- staff overview
- partner overview
- creator profile pages
- official merch storefront
- product detail, cart, checkout, and order lookup
- admin official merch and merch orders
- upload route
- support route

## AI Support Production Notes

If you are enabling the workflow-backed support path:

1. set `OPENAI_API_KEY`
2. set `OPENAI_WORKFLOW_ID`
3. optionally set `OPENAI_WORKFLOW_VERSION`
4. set `OPENAI_WEBHOOK_SECRET`
5. run:

```bash
npm run support:verify -- --base-url=https://your-domain.example --webhook-secret=whsec_...
```
