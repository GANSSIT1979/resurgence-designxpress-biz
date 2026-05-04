# RESURGENCE Prisma Multi-Event Patch

This ZIP contains the safe Prisma update for the multi-event sponsorship system.

## Files

- `prisma/schema.eventSlug.patch.prisma` - parseable patch/reference showing the updated SponsorSubmission model. Do not blindly replace your full schema with this minimal patch unless you merge it into the full schema.
- `prisma/migrations/20260504_add_event_slug/migration.sql` - SQL migration to add `eventSlug` and index safely.

## Required merge into existing prisma/schema.prisma

Inside `model SponsorSubmission`, add:

```prisma
eventSlug String @default("dayo-series-ofw-all-star")
```

Add this index inside the same model:

```prisma
@@index([eventSlug, status, createdAt])
```

## Apply

```bash
npx prisma migrate dev --name add_event_slug
npx prisma generate
```

For production after committing migration:

```bash
npx prisma migrate deploy
npx prisma generate
```
