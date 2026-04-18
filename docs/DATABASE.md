# DATABASE

Updated: 2026-04-16

## Provider Strategy

- Local development: SQLite
- Production target: PostgreSQL

## Prisma Source of Truth

- template schema: `prisma/schema.template.prisma`
- generated schema: `prisma/schema.prisma`
- prepare script: `scripts/prepare-prisma.mjs`

Use the npm scripts so Prisma always runs against the prepared schema.

## Major Model Areas

### Identity and Access

- `User`
- `Setting`
- `Notification`
- `EmailQueue`

### Sponsorship and Partnerships

- `Sponsor`
- `SponsorPackage`
- `SponsorProfile`
- `SponsorApplication`
- `SponsorDeliverable`
- `Partner`

### Creator and Media

- `CreatorProfile`
- `MediaEvent`
- `GalleryMedia`
- `SponsorInventoryItem`

### Finance

- `Invoice`
- `CashierTransaction`
- `Receipt`
- `Counter`

### Support and Intake

- `Inquiry`
- `ChatConversation`
- `ChatMessage`
- `ReportSnapshot`

## Local Database Commands

```bash
npm run prisma:generate
npm run db:push
npm run db:seed
```

## Known Schema Drift

Some legacy pages and API routes still reference delegates or field names that are not part of the active Prisma schema. The current documentation reflects the schema, not the stale legacy references.

Examples of drift still being cleaned up:

- `pageContent` delegate references
- older sponsor profile helper assumptions
- older cashier field names such as `invoiceNumber` and `receiptNumber`

## Recommendation

Treat the database layer as authoritative. When a page, route, or note conflicts with Prisma, follow the schema and update the code path rather than the documentation.
