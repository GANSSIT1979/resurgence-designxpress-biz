# Deployment Guide

This guide is aligned to the **current project state**:
- Prisma 6.x
- Node 20.x target
- PostgreSQL for production
- AI support optional
- local file uploads acceptable for testing, but not ideal for long-term production storage

## Production baseline

Recommended production setup:

- **App runtime:** Node 20.x
- **Database:** PostgreSQL
- **Prisma provider:** `postgresql`
- **Auth secret:** strong random value
- **Uploads:** migrate away from `/public/uploads` for serious production use

## Required production environment variables

```env
PRISMA_DB_PROVIDER=postgresql
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?schema=public"
AUTH_SECRET="use-a-long-random-secret"
NEXT_PUBLIC_SITE_URL="https://your-domain.com"

OPENAI_API_KEY=""
OPENAI_WORKFLOW_ID=""
OPENAI_WEBHOOK_SECRET=""
```

## Pre-deployment checklist

Before deploying, confirm:

- `npm install` completes successfully
- `npm run prisma:generate` works locally
- local smoke test passes
- production database exists
- `AUTH_SECRET` is strong and unique
- `NEXT_PUBLIC_SITE_URL` matches the deployed public URL
- you understand that `/public/uploads` is not a durable storage strategy on serverless platforms

## Option 1: Vercel + PostgreSQL

Use this for a fast hosted deployment with a managed PostgreSQL database.

### Steps
1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Add environment variables in Vercel.
4. Point `DATABASE_URL` to managed PostgreSQL.
5. Ensure Prisma Client is generated during build.
6. Run database push or migrations against PostgreSQL.
7. Seed only controlled staging or production data if needed.

### Build command
Use a build command that guarantees Prisma Client generation before Next.js builds:

```bash
npm install && npm run prisma:generate && npm run build
```

### Start command
Vercel handles the Next.js runtime automatically.

### Important note
Vercel file systems are ephemeral. `/public/uploads` is fine for local development, but production uploads should eventually move to object storage such as S3, R2, Supabase Storage, or similar.

## Option 2: Railway

Railway is a good fit when you want app + PostgreSQL in one place.

### Steps
1. Create a PostgreSQL service.
2. Deploy the Node app service from the repository.
3. Set:
   - `PRISMA_DB_PROVIDER=postgresql`
   - `DATABASE_URL=<railway-postgres-url>`
   - `AUTH_SECRET=<strong-secret>`
   - `NEXT_PUBLIC_SITE_URL=<public-url>`
4. Run:
   - `npm run prisma:generate`
   - `npm run db:push`
5. Seed only if appropriate for the environment:
   - `npm run db:seed`

## Option 3: Render

Render supports persistent services and managed PostgreSQL.

### Steps
1. Create a managed PostgreSQL database.
2. Create a web service from the repository.
3. Set the same environment variables.
4. Use build command:

```bash
npm install && npm run prisma:generate && npm run build
```

5. Use start command:

```bash
npm start
```

## Option 4: Docker

### Build
```bash
docker build -t resurgence-fullstack .
```

### Run against an external PostgreSQL database
```bash
docker run -p 3000:3000 \
  -e PRISMA_DB_PROVIDER=postgresql \
  -e DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?schema=public" \
  -e AUTH_SECRET="change-me" \
  -e NEXT_PUBLIC_SITE_URL="http://localhost:3000" \
  resurgence-fullstack
```

### Docker Compose
A sample `docker-compose.yml` is included with:
- app service
- PostgreSQL service

If you use the included compose file in development or staging, verify that environment values match your actual target provider settings.

## Database deployment notes

### Local development
Use:

```env
PRISMA_DB_PROVIDER=sqlite
DATABASE_URL="file:./dev.db"
```

### Production
Use:

```env
PRISMA_DB_PROVIDER=postgresql
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?schema=public"
```

Then run:

```bash
npm run prisma:generate
npm run db:push
```

Seed only when appropriate:

```bash
npm run db:seed
```

## AI support in deployment

AI support is currently **optional**.

### Base deployment
The project should still build and run without installing the OpenAI Agents SDK.

### If enabling AI later
Treat AI enablement as a controlled follow-up:
- install any AI-only packages intentionally
- verify dependency compatibility
- set `OPENAI_API_KEY`
- test `/support` and related AI routes in staging before production rollout

## Recommended production hardening

- Move uploads from `/public/uploads` to object storage
- Rotate `AUTH_SECRET`
- Add rate limiting
- Add audit logs
- Add queue-backed email processing
- Add backup and restore policy for PostgreSQL
- Add observability and error tracking
- Add server-side pagination and filtering on larger data sets
- Add richer module-specific admin forms where needed

## Troubleshooting

### `@prisma/client did not initialize yet`
Run:

```bash
npm run prisma:generate
```

Then rebuild or restart the app.

### Prisma 7 config errors
This project is currently aligned to **Prisma 6.x**.  
If Prisma 7 was downloaded accidentally by `npx` because install was incomplete, fix dependencies first, then run:

```bash
npm install
npm run prisma:generate
```

### Node engine warning
If you see an engine mismatch warning, switch to **Node 20 LTS** for the cleanest supported deployment path.

### AI routes fail while the rest of the app works
That is acceptable in the current optional-AI setup, as long as those routes fail gracefully and do not break the full build.

## Final recommendation

For the cleanest production path today:

- use **Node 20.x**
- use **PostgreSQL**
- generate Prisma Client during build
- treat AI as optional until you intentionally enable and verify it
- move uploads to object storage before serious production use
