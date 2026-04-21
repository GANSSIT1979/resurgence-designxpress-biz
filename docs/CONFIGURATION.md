# CONFIGURATION

Updated: 2026-04-19

## Core Environment Variables

### Database

```env
PRISMA_DB_PROVIDER="sqlite"
DATABASE_URL="file:./dev.db"
```

Production-style provider:

```env
PRISMA_DB_PROVIDER="postgresql"
DATABASE_URL="postgresql://postgres.dkipwveehizhmdiceabm:[YOUR-PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"
```

Admin-only direct Supabase connection for one-off maintenance tasks:

```env
postgresql://postgres:[YOUR-PASSWORD]@db.dkipwveehizhmdiceabm.supabase.co:5432/postgres
```

For this project, keep the runtime `DATABASE_URL` on the session pooler. The direct `db.dkipwveehizhmdiceabm.supabase.co:5432` host is documented for admin use only and may not be reachable on IPv4-only networks.

### Authentication And Site Metadata

```env
ADMIN_EMAIL="admin@resurgence.local"
ADMIN_PASSWORD_HASH=""
JWT_SECRET="change-this-super-secret-key"
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

`ADMIN_PASSWORD_HASH` is only for the emergency fallback admin flow. Normal sign-in uses seeded database users.

### Manual Shop Payment Instructions

```env
GCASH_NUMBER="replace-with-gcash-number"
MAYA_NUMBER=""
BANK_ACCOUNT_NAME="replace-with-bank-account-name"
BANK_ACCOUNT_NUMBER="replace-with-bank-account-number"
BANK_NAME="replace-with-bank-name"
```

These values are used on `/checkout` for customer-facing manual GCash, Maya, and bank transfer instructions.

### HTTPS

```env
NEXT_PUBLIC_SITE_URL="https://resurgence-dx.biz"
FORCE_HTTPS="true"
```

HTTPS behavior:

- `NEXT_PUBLIC_SITE_URL` should use the final `https://` production origin.
- `FORCE_HTTPS=true` redirects HTTP requests to HTTPS for non-local hosts.
- local hosts such as `localhost` and `127.0.0.1` are not force-redirected, so normal local development still works.
- use `npm run dev:https` for local HTTPS with the certificates in `certificates/`.
- local network IPs are automatically added to `allowedDevOrigins` during development.
- set `NEXT_ALLOWED_DEV_ORIGINS` to a comma-separated list if you need extra development hostnames.
- production TLS certificates should be handled by Vercel, Railway, Render, Docker ingress, Nginx, Caddy, or another HTTPS-capable host/proxy.

### Support And Webhooks

```env
OPENAI_API_KEY="your_openai_api_key"
OPENAI_WORKFLOW_ID="wf_your_workflow_id"
OPENAI_WORKFLOW_VERSION="1"
OPENAI_WEBHOOK_SECRET="whsec_your_webhook_secret"
OPENAI_DEFAULT_MODEL="gpt-4.1-mini"
EMAIL_WEBHOOK_URL=""
EMAIL_WEBHOOK_SECRET=""
```

`OPENAI_WORKFLOW_VERSION` is optional. If set, use only the plain version number, such as `1`.

## Prisma Script Flow

- active schema file: `prisma/schema.prisma`
- npm prep script: `scripts/prepare-prisma-schema.mjs`
- package scripts: `prisma:generate`, `db:push`, `db:migrate`, `db:seed`, `build`

The package scripts use `scripts/prepare-prisma-schema.mjs` to switch the datasource provider directly inside `prisma/schema.prisma`.

For Vercel production setup, use `vercel.production.env.example` as the copy-ready environment reference and run `npm run db:deploy` with `PRISMA_DB_PROVIDER=postgresql` and the production pooler `DATABASE_URL`. Only swap in the direct Supabase host for admin-only maintenance tasks when your network can reach it.

For PostgreSQL targets, `npm run db:deploy` prepares the Prisma schema, runs `prisma db push`, then applies the checked-in `prisma/postgres-hardening.sql` and `prisma/postgres-public-read-policies.sql` files.

`prisma/schema.template.prisma` and `scripts/prepare-prisma.mjs` are still in the repo, but they are legacy artifacts and are not the default path used by `package.json`.

## Upload Configuration

- upload API: `POST /api/uploads/image`
- image serving API for database-backed uploads: `GET /api/uploads/image/[id]`
- image serving API for proxied Cloudflare R2 uploads: `GET /api/uploads/r2/[...key]`
- local filesystem storage path: `public/uploads/<scope>/<year>/<month>`
- production/serverless storage: set `UPLOAD_STORAGE=r2` for Cloudflare R2, `UPLOAD_STORAGE=database` for PostgreSQL-backed storage, or omit it on Vercel where database storage is selected automatically
- accepted file types: JPG, PNG, WEBP, GIF
- size limit: `5 MB`
- upload scopes: `sponsor`, `creator`, `brand-profile`, `merch`

Cloudflare R2 variables:

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET`
- optional `R2_PUBLIC_BASE_URL`

Role access:

- `SYSTEM_ADMIN`: `sponsor`, `creator`, `brand-profile`, `merch`
- `SPONSOR`: `brand-profile`
- `PARTNER`: `brand-profile`

## Public Registration Configuration

The login page supports free public account creation for:

- Regular Member
- Creator
- Coach
- Referee
- Sponsor
- Partner

Authentication routes:

- `POST /api/auth/google`
- `POST /api/auth/mobile/request-otp`
- `POST /api/auth/mobile/verify-otp`

Environment variables:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_ID=""
OTP_DELIVERY_MODE="demo"
SMS_WEBHOOK_URL=""
SMS_WEBHOOK_SECRET=""
```

Notes:

- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` enables the client-side Gmail button.
- `GOOGLE_CLIENT_ID` is used server-side to verify the Google credential audience. It should match the public client ID.
- `OTP_DELIVERY_MODE=demo` returns the OTP in the API response for setup/testing.
- `OTP_DELIVERY_MODE=webhook` posts the OTP payload to `SMS_WEBHOOK_URL` for real SMS delivery.

## Support Configuration

- `/support` is the public entry point
- `/api/chatkit/session` bootstraps the support widget and local ChatKit-style session response
- `/api/chatkit/message` uses the stored OpenAI prompt template when `OPENAI_API_KEY` and `OPENAI_WORKFLOW_ID` are configured, otherwise it falls back to local routing
- `/api/chatkit/lead` creates `Inquiry` records and workflow automation records
- `/api/openai/webhook` verifies signed webhook payloads when the signing secret is configured

## Recommendations

- keep local development on SQLite unless you are testing deployment parity
- use PostgreSQL for production
- rotate `JWT_SECRET` and demo credentials before deployment
- use database-backed uploads or external object storage in production; do not rely on Vercel app filesystem writes
