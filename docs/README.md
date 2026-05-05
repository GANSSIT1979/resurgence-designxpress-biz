# Documentation Index

This folder contains production, deployment, database, security, billing, authentication, operations, support, API, and feature runbooks for **RESURGENCE Powered by DesignXpress**.

Updated: 2026-05-02

## Core Documents

| File | Purpose |
|---|---|
| `ARCHITECTURE.md` | Current Next.js 15 App Router architecture, public/protected route surfaces, auth, data, feed, commerce, sponsor, PayPal, automation, and observability layers. |
| `ADMIN_GUIDE.md` | Admin dashboard scope, daily operations, users/roles, creator/feed moderation, merch admin, support records, and admin API notes. |
| `AI_SUPPORT_PRODUCTION.md` | Support desk production checklist, OpenAI workflow setup, ChatKit-style routes, webhook verification, and fallback behavior. |
| `API.md` | Current route-handler inventory for auth, support, feed, creator, uploads, sponsor, partner, staff, cashier, and admin surfaces. |
| `CONFIGURATION.md` | Environment variable source of truth, Prisma provider behavior, auth, support, upload, PayPal/manual payment, and hosted/local examples. |
| `CHANGELOG.md` | Historical release and documentation changes. |
| `CODEBASE_TASK_PROPOSALS.md` | Historical handoff notes and small task proposals; not the live roadmap. |
| `INSTALL.md` | Local setup, dependencies, environment preparation, and development commands. |
| `DEPLOYMENT.md` | Vercel deployment, domains, environment variables, production verification, and smoke testing. |
| `DATABASE_MIGRATION_RUNBOOK.md` | Prisma/Supabase schema workflow, generated schema behavior, and database safety guidance. |
| `TROUBLESHOOTING.md` | Known errors, build issues, OAuth problems, deployment failures, and exact fixes. |
| `SECURITY.md` | Auth, sessions, uploads, webhook validation, PayPal verification, admin access, and secret-handling guidance. |
| `USER_GUIDE.md` | Public, member, creator, sponsor, partner, cashier, staff, and admin usage guide. |
| `ROADMAP.md` | Current product, creator-commerce, media, PayPal billing, automation, and release-hardening priorities. |
| `PAYPAL_BILLING_SYSTEM.md` | PayPal sponsor checkout, invoice preview/create/send, capture, webhook, revenue, and dashboard runbook. |
| `CREATOR_EARNINGS_PAYOUT_SYSTEM.md` | Creator earnings, affiliate tracking, payout requests, admin approvals, and payout audit workflow. |
| `GOOGLE_AUTH_DEPLOYMENT_CHECKLIST.md` | Google Identity Services setup, OAuth client config, domains, Vercel env vars, and smoke tests. |
| `PRODUCTION_STATUS.md` | Current production health snapshot, known warnings, deployment status, and next maintenance priorities. |

## Current Application Stack

- Framework: `Next.js 15` App Router
- UI: React Server Components and Client Components
- API: Next.js Route Handlers under `src/app/api`
- Database: Prisma-backed PostgreSQL
- Production database target: Supabase PostgreSQL
- Deployment target: Vercel
- Auth cookie: `resurgence_admin_session`
- Online payment provider: PayPal
- Manual payment options: GCash, Maya, bank transfer, cash
- Active commerce model: public shop, client-side cart, checkout, order lookup
- Active creator/community model: creator-commerce feed, comments, likes, saves, follows, watch-time, and sponsor placements

The project is not a WordPress CMS, Laravel/PHP app, or static-only export. The current architecture is a full-stack React/Node application.

## Production URLs

Primary production URLs:

- Website: `https://www.resurgence-dx.biz`
- Root domain: `https://resurgence-dx.biz`
- Login domain: `https://login.resurgence-dx.biz`
- Health endpoint: `https://www.resurgence-dx.biz/api/health`
- Login: `https://www.resurgence-dx.biz/login`
- Public feed: `https://www.resurgence-dx.biz/feed`
- Shop: `https://www.resurgence-dx.biz/shop`
- Cart: `https://www.resurgence-dx.biz/cart`
- Checkout: `https://www.resurgence-dx.biz/checkout`
- Order lookup: `https://www.resurgence-dx.biz/account/orders`
- DAYO sponsor page: `https://www.resurgence-dx.biz/dayo-series-ofw-all-star`
- Sponsor application: `https://www.resurgence-dx.biz/sponsor/apply`
- Payment success: `https://www.resurgence-dx.biz/payment/success`
- PayPal webhook endpoint: `https://www.resurgence-dx.biz/api/paypal/webhook`
- Admin invoices: `https://www.resurgence-dx.biz/admin/invoices`
- Admin revenue dashboard: `https://www.resurgence-dx.biz/admin/revenue`
- Admin observability: `https://www.resurgence-dx.biz/admin/observability`

## Standard Verification Flow

Run before every commit that touches runtime code:

```bash
npm run type-check
npm run lint
npm run build
npx prisma migrate status
```

Expected result:

```txt
type-check passes
lint has warnings only or passes cleanly
build passes
Database schema is up to date
```

## Standard Deployment Flow

Deploy through Git push to the configured Vercel production branch:

```bash
git status
git add -A
git commit -m "Describe production-safe change"
git push origin main
```

Manual Vercel CLI deploy, when needed:

```bash
npx vercel --prod
```

## Documentation Integrity

Check Markdown links when the script is available:

```bash
npm run docs:check
```

Markdown standards:

- Use placeholder secrets only.
- Keep domains current.
- Include verification commands and expected output.
- Separate local, Vercel, Google Cloud, database, and PayPal instructions.
- Do not mix production secrets into examples.

## Security Reminder

Tracked docs and examples must stay placeholder-only. Never commit real database passwords, Supabase service role keys, PayPal secrets, OpenAI keys, Cloudflare R2 secrets, admin credentials, bank details, webhook secrets, private API tokens, or production session secrets.

If a secret is pasted into chat, logs, screenshots, Markdown, or committed history, rotate it immediately, update Vercel environment variables, redeploy, and treat the old secret as compromised.
