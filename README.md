# RESURGENCE Powered by DesignXpress

Updated: 2026-04-16

Deployable full-stack sponsorship and operations platform built with Next.js App Router, TypeScript, Prisma, JWT cookie auth, role-based dashboards, and OpenAI-backed support wiring.

## Current Snapshot

- Public pages for home, services, sponsors, creator profiles, inquiries, and support
- Role-based dashboards for admin, cashier, sponsor, staff, partner, and creator users
- Prisma-backed sponsor, creator, gallery, settings, inquiry, finance, and support data
- AI support routes for `/support`, `/api/chatkit/session`, `/api/chatkit/message`, and `/api/openai/webhook`
- Seeded demo accounts with hashed passwords

## Important Current Status

The active application and docs are updated, but the repository is not fully build-green yet.

As of 2026-04-16:

- `npx tsc --noEmit` still reports legacy module drift in unrelated areas
- `npm run build` currently stops on `@/lib/sponsor-server` missing from `src/app/api/sponsor/profile/route.ts`

Use this repository for active development and targeted feature verification, but do not treat it as fully production-ready until those blockers are repaired.

## Quick Start

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run db:push
npm run db:seed
npm run dev
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
npm install
npm run prisma:generate
npm run db:push
npm run db:seed
npm run dev
```

## Core URLs

- `http://localhost:3000`
- `http://localhost:3000/login`
- `http://localhost:3000/support`
- `http://localhost:3000/api/health`

## AI Support Verification

```bash
npm run support:verify -- --base-url=http://localhost:3000
```

Production:

```bash
npm run support:verify -- --base-url=https://your-domain.example --webhook-secret=whsec_...
```

## Documentation

The canonical documentation set lives in [`docs/`](./docs/README.md).

Recommended starting points:

- [`docs/INSTALL.md`](./docs/INSTALL.md)
- [`docs/QUICKSTART.md`](./docs/QUICKSTART.md)
- [`docs/API.md`](./docs/API.md)
- [`docs/AI_SUPPORT_PRODUCTION.md`](./docs/AI_SUPPORT_PRODUCTION.md)
- [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md)
- [`docs/ROADMAP.md`](./docs/ROADMAP.md)

## OpenAI Support Notes

To finish production AI customer service:

1. Publish the OpenAI Agent Builder workflow
2. Save its ID to `OPENAI_WORKFLOW_ID`
3. Create the OpenAI project webhook
4. Save the signing secret to `OPENAI_WEBHOOK_SECRET`
5. Run the support verifier against the deployed domain
