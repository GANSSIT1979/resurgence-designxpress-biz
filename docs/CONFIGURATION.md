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
NEXT_PUBLIC_SITE_NAME="RESURGENCE Powered by DesignXpress"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_CONTACT_NAME="Jake Anilao"
NEXT_PUBLIC_CONTACT_EMAIL="resurgence.dx@gmail.com"
NEXT_PUBLIC_CONTACT_PHONE="09387841636"
NEXT_PUBLIC_CONTACT_ADDRESS="Official business address to follow"
```

`ADMIN_PASSWORD_HASH` is only for the emergency fallback admin flow. Normal sign-in uses seeded database users.

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
- upload scopes: `sponsor`, `creator`, `brand-profile`

Role access:

- `SYSTEM_ADMIN`: `sponsor`, `creator`, `brand-profile`
- `SPONSOR`: `brand-profile`
- `PARTNER`: `brand-profile`

## Support Configuration

- `/support` is the public entry point
- `/api/chatkit/session` bootstraps the support widget and local ChatKit-style session response
- `/api/chatkit/message` is the current rule-based support router
- `/api/chatkit/lead` creates `Inquiry` records and workflow automation records
- `/api/openai/webhook` verifies signed webhook payloads when the signing secret is configured

## Recommendations

- keep local development on SQLite unless you are testing deployment parity
- use PostgreSQL for production
- rotate `JWT_SECRET` and demo credentials before deployment
- move uploads off the app filesystem for long-term production use
