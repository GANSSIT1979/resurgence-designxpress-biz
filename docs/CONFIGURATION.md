# CONFIGURATION

Updated: 2026-04-23
## Environment Variable Source Of Truth

This repo currently treats:

- `DATABASE_URL` as the Prisma and runtime database source of truth
- `PRISMA_DB_PROVIDER` as the optional provider override for generated-schema prep

Important accuracy notes:

- the checked-in Prisma schemas use `env("DATABASE_URL")`
- `scripts/prepare-prisma-schema.mjs` infers the provider from `PRISMA_DB_PROVIDER` or `DATABASE_URL`
- the current app does not use a direct Supabase SDK client in `src/`
- Supabase or Vercel helper variables do not replace `DATABASE_URL` unless you explicitly copy or map them yourself

## Required In The Current Codebase

Always required for a real working environment:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="local-dev-jwt-secret-not-for-production"
```

Hosted baseline:

```env
PRISMA_DB_PROVIDER="postgresql"
DATABASE_URL="postgresql://..."
JWT_SECRET="replace-with-a-long-random-production-secret"
```

Notes:

- local development can stay on SQLite
- hosted builds should use PostgreSQL
- `PRISMA_DB_PROVIDER=postgresql` is strongly recommended on Preview and Production even when `DATABASE_URL` is already PostgreSQL

## Recommended Public Runtime Configuration

These are not all universally required, but they are part of the normal app surface:

```env
COMPANY_NAME="DesignXpress Merchandising OPC"
NEXT_PUBLIC_SITE_NAME="Resurgence Powered by DesignXpress"
NEXT_PUBLIC_SITE_URL="https://resurgence-dx.biz"
FORCE_HTTPS="true"
NEXT_ALLOWED_DEV_ORIGINS=""
NEXT_PUBLIC_CONTACT_NAME="Jake Anilao"
NEXT_PUBLIC_CONTACT_ROLE="Sponsorship / Partnerships"
NEXT_PUBLIC_CONTACT_EMAIL="partnerships@resurgence-dx.biz"
NEXT_PUBLIC_CONTACT_PHONE="+639387841636"
NEXT_PUBLIC_SUPPORT_EMAIL="support@resurgence-dx.biz"
NEXT_PUBLIC_SUPPORT_PHONE="+639957558147"
NEXT_PUBLIC_BUSINESS_HOURS="Monday to Saturday, 9:00 AM to 6:00 PM, Asia/Manila"
NEXT_PUBLIC_LOCATION="Philippines"
NEXT_PUBLIC_CURRENCY="PHP"
NEXT_PUBLIC_PAYMENT_METHODS="GCash, Maya, Bank Transfer, Credit/Debit Card, Cash"
NEXT_PUBLIC_SHIPPING_AREA="Philippines nationwide"
NEXT_PUBLIC_CONTACT_ADDRESS="Philippines"
```

## Feature-Gated Optional Variables

### Google And Mobile Auth

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_ID=""
OTP_DELIVERY_MODE="demo"
SMS_WEBHOOK_URL=""
SMS_WEBHOOK_SECRET=""
```

Notes:

- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` enables the client-side Google button
- `GOOGLE_CLIENT_ID` is used server-side to verify the credential audience
- `OTP_DELIVERY_MODE=demo` returns the OTP in the API response for setup/testing
- `OTP_DELIVERY_MODE=webhook` posts the OTP payload to `SMS_WEBHOOK_URL`

### Support And Webhooks

```env
OPENAI_API_KEY=""
OPENAI_WORKFLOW_ID=""
OPENAI_WORKFLOW_VERSION="1"
OPENAI_WEBHOOK_SECRET=""
OPENAI_DEFAULT_MODEL="gpt-4.1-mini"
EMAIL_WEBHOOK_URL=""
EMAIL_WEBHOOK_SECRET=""
```

### Cloudflare Stream

```env
CLOUDFLARE_ACCOUNT_ID=""
CLOUDFLARE_STREAM_TOKEN=""
CLOUDFLARE_STREAM_CUSTOMER_CODE=""
CLOUDFLARE_STREAM_ALLOWED_ORIGINS="https://resurgence-dx.biz"
CLOUDFLARE_STREAM_MAX_DURATION_SECONDS="300"
CLOUDFLARE_REQUIRE_SIGNED_URLS="false"
```

These variables support the direct-upload creator flow and feed playback path.

### Upload Delivery

Database-backed and R2-backed image delivery use:

```env
UPLOAD_STORAGE="database"
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET=""
R2_PUBLIC_BASE_URL=""
```

### Manual Shop Payment Instructions

```env
GCASH_NUMBER=""
MAYA_NUMBER=""
BANK_ACCOUNT_NAME=""
BANK_ACCOUNT_NUMBER=""
BANK_NAME=""
```

### Optional Emergency Fallback Admin

```env
ADMIN_EMAIL="admin@resurgence.local"
ADMIN_PASSWORD_HASH=""
```

`ADMIN_PASSWORD_HASH` is only for the emergency fallback admin flow. Normal sign-in uses database users.

## Optional Platform Helper Variables Not Read Directly By App Code

These can exist in Vercel or Supabase, but the current codebase does not read them directly:

- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_PASSWORD`

Accuracy note:

- keep them only if your platform injects them or you intentionally use them for manual admin/database tasks
- they do not satisfy Prisma for this repo unless their value is copied into `DATABASE_URL`

## Unused In The Current Codebase

These are not used by the current application code:

- `SUPABASE_SECRET_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`

Recommended handling:

- do not add them just to make Prisma or auth work
- never expose them through `NEXT_PUBLIC_*`
- if they were shared or pasted into insecure places, rotate them

## Local Example

```env
PRISMA_DB_PROVIDER="sqlite"
DATABASE_URL="file:./dev.db"
JWT_SECRET="local-dev-jwt-secret-not-for-production"
FORCE_HTTPS="false"
```

## Hosted Example

```env
PRISMA_DB_PROVIDER="postgresql"
DATABASE_URL="postgresql://POOLER_USER:POOLER_PASSWORD@POOLER_HOST:6543/postgres?sslmode=require&pgbouncer=true"
JWT_SECRET="replace-with-a-long-random-production-secret"
NEXT_PUBLIC_SITE_URL="https://resurgence-dx.biz"
FORCE_HTTPS="true"
```

## Prisma Script Flow

- source schema file: `prisma/schema.prisma`
- generated schema file: `prisma/schema.generated.prisma`
- prep script: `scripts/prepare-prisma-schema.mjs`
- push script: `scripts/push-prisma-schema.mjs`

Active package scripts:

- `npm run prisma:prepare`
- `npm run prisma:generate`
- `npm run db:push`
- `npm run db:migrate`
- `npm run db:deploy`
- `npm run db:migrate:deploy`

Important accuracy note:

- build, generate, and migrate commands target `schema.generated.prisma`
- `db:deploy` is the repo's push-style path
- reviewed migrations should use `db:migrate` and `db:migrate:deploy`

## Upload Configuration

- image upload API: `POST /api/uploads/image`
- database-backed image serving: `GET /api/uploads/image/[id]`
- proxied R2 image serving: `GET /api/uploads/r2/[...key]`
- creator video upload: `POST /api/media/cloudflare/direct-upload`
- accepted image types: JPG, PNG, WEBP, GIF
- image size limit: `5 MB`
- upload scopes: `sponsor`, `creator`, `brand-profile`, `merch`

## Recommendations

- keep local development on SQLite unless you are testing hosted parity
- use PostgreSQL for Preview and Production
- keep `DATABASE_URL` as the single runtime database source of truth
- rotate `JWT_SECRET` and demo credentials before deployment
- use database-backed storage, R2, or Cloudflare Stream in hosted environments
- do not rely on Vercel filesystem persistence for durable uploads or media
