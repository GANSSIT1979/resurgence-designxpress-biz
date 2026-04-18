# RESURGENCE Documentation

Updated: 2026-04-16

## Snapshot

RESURGENCE Powered by DesignXpress is a Next.js + Prisma multi-role platform for sponsorship operations, creator management, partner coordination, cashier workflows, and AI-assisted customer service.

## Current Repository State

- Public website pages and multi-role dashboards are present in the active `src/` application.
- Prisma is configured through `prisma/schema.template.prisma` and prepared by `scripts/prepare-prisma.mjs`.
- Demo users are seeded with hashed passwords.
- AI customer service routes now cover `/support`, `/api/chatkit/session`, `/api/chatkit/message`, and `/api/openai/webhook`.
- The repository is not fully build-green yet. As of 2026-04-16, `npm run build` stops on a missing `@/lib/sponsor-server` import and `npx tsc --noEmit` still reports legacy schema and route drift in unrelated modules.

## Canonical Docs

- [INSTALL.md](./INSTALL.md)
- [QUICKSTART.md](./QUICKSTART.md)
- [ARCHITECTURE.md](./ARCHITECTURE.md)
- [API.md](./API.md)
- [DATABASE.md](./DATABASE.md)
- [DEPLOYMENT.md](./DEPLOYMENT.md)
- [CONFIGURATION.md](./CONFIGURATION.md)
- [SECURITY.md](./SECURITY.md)
- [TESTING.md](./TESTING.md)
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- [CHANGELOG.md](./CHANGELOG.md)
- [USER_GUIDE.md](./USER_GUIDE.md)
- [ADMIN_GUIDE.md](./ADMIN_GUIDE.md)
- [ROADMAP.md](./ROADMAP.md)
- [AI_SUPPORT_PRODUCTION.md](./AI_SUPPORT_PRODUCTION.md)

## Recommended Read Order

1. `INSTALL.md`
2. `QUICKSTART.md`
3. `CONFIGURATION.md`
4. `DATABASE.md`
5. `API.md`
6. `AI_SUPPORT_PRODUCTION.md`
7. `TROUBLESHOOTING.md`
8. `ROADMAP.md`

## Primary Working Areas

- Public pages: Home, About, Services, Sponsors, Sponsor Apply, Contact, Support, Creator profiles
- Dashboards: Admin, Cashier, Sponsor, Staff, Partner, Creator
- Finance: invoices, transactions, receipts, summary and revenue monitoring routes
- Support: chat session bootstrap, route-aware messaging, lead capture, signed OpenAI webhook verification
- CMS: sponsors, partners, creators, gallery, media events, products and services, settings

## Known Repair Themes

- Sponsor portal typing and missing `sponsor-server` helper
- Legacy content and gallery delegates that do not yet match the active Prisma schema
- Cashier route field names that still reference older invoice and receipt shapes
- Creator and dashboard typing mismatches in a few legacy pages

## Documentation Policy

The `docs/` folder is the canonical documentation set. Root-level patch notes are retained as historical implementation notes and should not override these documents.
