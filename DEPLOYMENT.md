# Deployment Guide

## Option 1: Vercel + PostgreSQL

Use this for a fast hosted deployment with a managed Postgres database.

### Environment
```env
PRISMA_DB_PROVIDER=postgresql
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?schema=public"
AUTH_SECRET="use-a-long-random-secret"
NEXT_PUBLIC_SITE_URL="https://your-domain.com"

OPENAI_API_KEY=""
OPENAI_WORKFLOW_ID=""
OPENAI_WEBHOOK_SECRET=""
```

### Steps
1. Push the repository to GitHub.
2. Import the project into Vercel.
3. Add environment variables in Vercel.
4. Run schema push or migrations against PostgreSQL.
5. Seed once against production or staging with controlled data only.

### Important note
Vercel file systems are ephemeral. `/public/uploads` works for local dev or stateful servers, but production should eventually move uploads to object storage like S3 / R2 / Supabase Storage.

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

### Run against an external database
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

## Recommended production hardening

- Replace `/public/uploads` with object storage
- Rotate `AUTH_SECRET`
- Add rate limiting
- Add audit logs
- Add email worker processing
- Move generic CRUD pages into richer module-specific forms
- Add server-side pagination and search for larger data sets
- Add backup policy for PostgreSQL
