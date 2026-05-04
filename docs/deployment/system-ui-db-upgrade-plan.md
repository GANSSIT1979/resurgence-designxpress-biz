# System UI + DB Upgrade Plan

## UI pages to upgrade

- `src/app/sponsors/page.tsx`
- `src/app/events/page.tsx`
- `src/app/events/[slug]/page.tsx`
- `src/app/events/[slug]/apply/page.tsx`
- `src/app/creators/page.tsx`
- `src/app/creators/[slug]/page.tsx`
- `src/app/shop/page.tsx`
- `src/app/shop/product/[slug]/page.tsx`
- `src/app/admin/page.tsx`
- `src/app/admin/events/page.tsx`
- `src/app/admin/sponsor-crm/page.tsx`
- `src/app/crm/page.tsx`

## UI principles

- Use premium card layouts.
- Keep CTA language consistent.
- Never expose private Vercel dashboard/deployment links in public UI.
- Read sponsor tiers from `SponsorPackageTemplate` where available.
- Use fallback package definitions only when DB records are unavailable.
- Make event pages driven by slug and `eventId`.
- Keep schedule sections hidden when empty and show `Coming Soon` only when needed.
- Preserve mobile-first layout and accessible links/buttons.

## DB principles

- Do not create duplicate sponsor package tables.
- Keep `SponsorPackageTemplate` as package-tier source of truth.
- Connect sponsor submissions, proposals, payments, pipeline stages, and pipeline activities to `Event` via nullable `eventId` fields.
- Use nullable fields for rollout safety.
- Backfill event links after migration where deterministic.

## Recommended implementation phases

1. Apply helper files and migration SQL.
2. Run Prisma generate and build.
3. Deploy migration to staging/preview database.
4. Wire public pages to helpers.
5. Wire admin dashboard to event-filtered sponsor records.
6. Promote to production only after Vercel and Supabase revisions match.
