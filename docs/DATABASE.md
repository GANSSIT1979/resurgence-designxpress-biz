# DATABASE

Updated: 2026-04-19

For the current additive `ContentPost` / `MediaAsset` migration rollout, also use [PRISMA_MIGRATION_ROLLOUT_CHECKLIST.md](./PRISMA_MIGRATION_ROLLOUT_CHECKLIST.md).

## Provider Strategy

- Local development: SQLite
- Production-style provider: PostgreSQL

## Prisma Source Of Truth

- active schema file: `prisma/schema.prisma`
- active prep script: `scripts/prepare-prisma-schema.mjs`
- seed file: `prisma/seed.ts`

The app, Prisma Client, and package scripts all run against `prisma/schema.prisma`. The prep script only rewrites the datasource provider.

## Major Model Areas

### Identity And Access

- `User`
- `SponsorProfile`
- `StaffProfile`
- `PartnerProfile`

### Public Intake And Support

- `Inquiry`
- `SponsorSubmission`
- `PlatformNotification`
- `AutomatedEmail`

### Sponsorship Operations

- `Sponsor`
- `SponsorPackageTemplate`
- `SponsorDeliverable`
- `SponsorInventoryCategory`

### Partner Operations

- `Partner`
- `PartnerCampaign`
- `PartnerReferral`
- `PartnerAgreement`

### Staff Operations

- `StaffTask`
- `StaffScheduleItem`
- `StaffAnnouncement`

### Media And Content

- `PageContent`
- `CreatorProfile`
- `MediaEvent`
- `GalleryMedia`
- `ProductService`
- `AppSetting`
- `AdminReport`

### Finance

- `Invoice`
- `CashierTransaction`
- `Receipt`

### Commerce

- `ShopCategory`
- `ShopProduct` with official merch metadata, available sizes/colors, material, fit, and care fields
- `ShopOrder`
- `ShopOrderItem` with selected variant labels for fulfillment

## Seed Data

`prisma/seed.ts` populates:

- five demo users
- sponsors, partner records, package templates, creators, media, settings
- sponsor profile, partner profile, staff profile data
- inquiries, tasks, schedule items, announcements
- invoices, transactions, receipts
- official merch categories and products
- platform notifications and automated email records

## Local Commands

```bash
npm run prisma:generate
npm run db:push
npm run db:seed
```

## Recommendation

Treat `prisma/schema.prisma` as the database authority. If a historical note or stale route name conflicts with Prisma, Prisma wins.

For production rollouts that must avoid schema drift, generate reviewed migrations in development and deploy them with `npm run db:migrate:deploy` against the target PostgreSQL database before promoting the matching app code.
