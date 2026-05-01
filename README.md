# RESURGENCE Powered by DesignXpress

Production-ready full-stack platform for RESURGENCE Powered by DesignXpress.

The system supports public pages, creator/community content, sponsorship workflows, partner operations, shop/checkout, cashiering, admin management, creator analytics, creator earnings, payout requests, AI support/chat workflows, and mobile-ready APIs.

## Production

- Website: https://www.resurgence-dx.biz
- Health: https://www.resurgence-dx.biz/api/health
- Platform: Vercel
- Region: `sin1`
- Database: PostgreSQL / Supabase
- ORM: Prisma
- Framework: Next.js 15 App Router

## Current production status

Latest confirmed health response:

```json
{
  "ok": true,
  "status": "ok",
  "database": "connected",
  "aiConfigured": true,
  "schema": {
    "status": "ok",
    "issues": []
  }
}
```

## Stack

- Next.js 15 App Router
- React 19
- Prisma 6
- PostgreSQL / Supabase
- Vercel
- JWT / role-based access control
- OpenAI / ChatKit support workflows
- TypeScript
- Tailwind CSS
- Expo mobile app under `apps/mobile`

## Key modules

- Public marketing pages
- Creator profiles and creator feed
- Creator analytics
- Creator earnings and payout requests
- Admin payout approval and mark-paid workflows
- Sponsor applications, packages, placements, billing, deliverables
- Partner campaigns, agreements, referrals
- Shop products, cart, checkout, orders
- Cashier invoices, transactions, receipts, reports
- Staff tasks, inquiries, schedule, announcements
- AI support and ChatKit endpoints
- Health and runtime verification

## Important commands

```bash
npm install
npm run prisma:prepare
npm run prisma:generate
npm run docs:check
npm run local:preflight
npm run vercel-build
```

Deploy:

```bash
npx vercel --prod
```

Production smoke test:

```bash
curl -I https://www.resurgence-dx.biz
curl https://www.resurgence-dx.biz/api/health
```

## Prisma workflow

Use this for the current production database:

```bash
npm run db:push
npm run prisma:generate
```

Do not use `prisma migrate dev` against the current production Supabase database. The historical migration chain has a shadow database replay issue from an older migration. See:

```txt
docs/DATABASE_MIGRATION_RUNBOOK.md
```

## Documentation

Start here:

```txt
docs/README.md
```

Core runbooks:

```txt
docs/INSTALL.md
docs/DEPLOYMENT.md
docs/DATABASE_MIGRATION_RUNBOOK.md
docs/TROUBLESHOOTING.md
docs/CREATOR_EARNINGS_PAYOUT_SYSTEM.md
docs/PRODUCTION_STATUS.md
```
