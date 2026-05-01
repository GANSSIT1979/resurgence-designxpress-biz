# Documentation Index

This folder contains production, deployment, database, security, billing, and feature runbooks for RESURGENCE Powered by DesignXpress.

## Core documents

| File | Purpose |
|---|---|
| `INSTALL.md` | Local setup and development commands |
| `DEPLOYMENT.md` | Vercel deployment, domain, environment variables, and smoke testing |
| `DATABASE_MIGRATION_RUNBOOK.md` | Prisma/Supabase schema workflow |
| `TROUBLESHOOTING.md` | Known errors and exact fixes |
| `SECURITY.md` | Auth, uploads, webhook, PayPal, admin, and secret-handling guidance |
| `USER_GUIDE.md` | Public, role-based, sponsor, invoice, and admin user guide |
| `ROADMAP.md` | Current product, media, PayPal billing, and release-hardening priorities |
| `PAYPAL_BILLING_SYSTEM.md` | PayPal sponsor checkout, invoice, capture, webhook, and dashboard runbook |
| `CREATOR_EARNINGS_PAYOUT_SYSTEM.md` | Creator earnings, affiliate, and payout system |
| `PRODUCTION_STATUS.md` | Current production health snapshot |

## Production URLs

- Website: https://www.resurgence-dx.biz
- Health endpoint: https://www.resurgence-dx.biz/api/health
- Public feed: https://www.resurgence-dx.biz/feed
- Shop: https://www.resurgence-dx.biz/shop
- DAYO sponsor page: https://www.resurgence-dx.biz/dayo-series-ofw-all-star
- PayPal webhook endpoint: https://www.resurgence-dx.biz/api/paypal/webhook
- Admin invoices: https://www.resurgence-dx.biz/admin/invoices
- Admin revenue dashboard: https://www.resurgence-dx.biz/admin/revenue

## Standard verification flow

Run locally:

```bash
npm run docs:check
npm run local:preflight
npm run vercel-build
```

Deploy:

```bash
npx vercel --prod
```

Verify production:

```bash
curl -I https://www.resurgence-dx.biz
curl https://www.resurgence-dx.biz/api/health
```

## PayPal billing verification flow

Use PayPal sandbox until the complete flow is verified.

Required Vercel environment variables:

```env
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_ENV=sandbox
PAYPAL_CURRENCY=PHP
PAYPAL_SPONSOR_AMOUNT=1000.00
PAYPAL_WEBHOOK_ID=WH_your_webhook_id
NEXT_PUBLIC_BASE_URL=https://www.resurgence-dx.biz
```

Verify PayPal capabilities:

1. Create or submit a sponsor application.
2. Start PayPal checkout through `/api/sponsor/checkout`.
3. Complete sandbox payment and return to `/payment/success`.
4. Confirm capture updates sponsor status.
5. Create a PayPal invoice through `/api/invoice/paypal-create`.
6. Send it through `/api/invoice/paypal-send`.
7. Pay it with a sandbox buyer account.
8. Confirm `/api/paypal/webhook` updates the local invoice status to `PAID`.
9. Review `/admin/invoices` and `/admin/revenue`.

## Database workflow

For the current existing Supabase/PostgreSQL database, use:

```bash
npm run db:push
npm run prisma:generate
```

Avoid:

```bash
npx prisma migrate dev --schema prisma/schema.generated.prisma
```

Reason: historical migrations do not replay cleanly into a shadow database. See `DATABASE_MIGRATION_RUNBOOK.md`.

Recommended Supabase runtime/migration split:

```env
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
DIRECT_URL=postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres?sslmode=require
```

## Documentation integrity

Check Markdown links:

```bash
npm run docs:check
```

## Security reminder

Tracked docs and examples must stay placeholder-only. Never commit real database passwords, Supabase service role keys, PayPal secrets, OpenAI keys, R2 secrets, admin credentials, bank details, or webhook secrets.

If a secret is pasted into chat, logs, screenshots, or markdown, rotate it immediately and update Vercel environment variables before redeploying.
