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
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?schema=public"
```

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
OPENAI_WEBHOOK_SECRET="whsec_your_webhook_secret"
EMAIL_WEBHOOK_URL=""
EMAIL_WEBHOOK_SECRET=""
```

`OPENAI_WORKFLOW_VERSION` is optional. Add it manually if you want to pin a specific published workflow version.

## Prisma Script Flow

- active schema file: `prisma/schema.prisma`
- npm prep script: `scripts/prepare-prisma-schema.mjs`
- package scripts: `prisma:generate`, `db:push`, `db:migrate`, `db:seed`, `build`

The package scripts use `scripts/prepare-prisma-schema.mjs` to switch the datasource provider directly inside `prisma/schema.prisma`.

`prisma/schema.template.prisma` and `scripts/prepare-prisma.mjs` are still in the repo, but they are legacy artifacts and are not the default path used by `package.json`.

## Upload Configuration

- upload API: `POST /api/uploads/image`
- local storage path: `public/uploads/<scope>/<year>/<month>`
- accepted file types: JPG, PNG, WEBP, GIF
- size limit: `5 MB`
- upload scopes: `sponsor`, `creator`, `brand-profile`, `merch`

Role access:

- `SYSTEM_ADMIN`: `sponsor`, `creator`, `brand-profile`, `merch`
- `SPONSOR`: `brand-profile`
- `PARTNER`: `brand-profile`

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
- move uploads off the app filesystem for long-term production use
