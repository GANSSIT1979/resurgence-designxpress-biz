# DEPLOYMENT

## Supported Targets

- Vercel
- Railway
- Render
- Docker
- VPS or custom Node hosting

## Production Basics

Required production steps:

1. set production environment variables
2. point database to PostgreSQL
3. generate Prisma Client
4. run migrations or schema deployment
5. build and start the app

## Environment Baseline

Required or commonly used variables:

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `PRISMA_DB_PROVIDER`
- optional AI keys and webhooks

See [CONFIGURATION.md](sandbox:/mnt/data/resurgence-docs/CONFIGURATION.md)

## Vercel

Typical flow:

1. push repository to GitHub
2. import project into Vercel
3. configure environment variables
4. connect PostgreSQL or external database
5. build and deploy

Important:
- make sure build scripts run Prisma generate
- if using file uploads, do not rely on ephemeral filesystem storage for long-term persistence

## Railway / Render

Typical flow:

1. connect repository
2. provision PostgreSQL
3. set environment variables
4. run build command
5. run start command

Recommended:
- use persistent object storage for uploaded media in production
- keep `public/uploads` only for local or temporary workflows unless you add persistent disk support

## Docker

Typical pattern:

- install dependencies
- generate Prisma Client
- build Next.js app
- run production server

Make sure:
- `DATABASE_URL` is injected at runtime
- Prisma client is generated during build or container startup
- migrations are handled intentionally

## Release Checklist

- build passes
- Prisma generate passes
- schema matches generated client
- login works
- admin dashboard loads
- cashier dashboard loads
- sponsor dashboard loads
- support page degrades gracefully if AI is disabled
- uploads are either persistent or intentionally limited

## Production Storage Guidance

Local:
- `public/uploads`

Production:
- prefer object storage such as S3-compatible storage, Cloudflare R2, or similar

## Post-Deployment Validation

Verify:
- homepage
- login
- protected routes
- contact and sponsor apply forms
- admin overview
- cashier overview
- sponsor overview
- upload route
- support route
