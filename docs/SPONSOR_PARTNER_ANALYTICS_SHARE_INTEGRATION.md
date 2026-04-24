# SPONSOR_PARTNER_ANALYTICS_SHARE_PACK Integration

## What this pack adds

This pack adds a branded sponsor/partner analytics share layer on top of the existing creator analytics dashboard and API work.

Included:
- token creation route for sponsor/partner/public partner-safe share links
- branded sponsor share page
- printable sponsor summary card
- partner-safe snapshot page
- token manager UI for creators/admins/sponsors

## Install paths

- `src/app/api/sponsor/analytics/share-token/route.ts`
- `src/app/api/sponsor/analytics/share/[token]/route.ts`
- `src/app/sponsor/analytics/share/[token]/page.tsx`
- `src/app/partner/analytics/snapshot/[token]/page.tsx`
- `src/components/resurgence/SponsorAnalyticsShareCard.tsx`
- `src/components/resurgence/SponsorSnapshotPrintView.tsx`
- `src/components/resurgence/PartnerSafeAnalyticsSnapshot.tsx`
- `src/components/resurgence/AnalyticsShareTokenManager.tsx`
- `src/components/resurgence/SponsorAnalyticsSharePage.tsx`
- `src/components/resurgence/PartnerSafeAnalyticsSnapshotPage.tsx`
- `src/lib/sponsor-analytics-share/types.ts`
- `src/lib/sponsor-analytics-share/auth.ts`
- `src/lib/sponsor-analytics-share/tokens.ts`
- `src/lib/sponsor-analytics-share/buildSnapshot.ts`

## Current persistence shape

This pack ships with a demo token flow so the pages render immediately.

Before production:
1. add a Prisma model for share tokens, for example `CreatorAnalyticsShareToken`
2. replace the demo token record in `GET /api/sponsor/analytics/share/[token]`
3. persist `tokenRecord` in `POST /api/sponsor/analytics/share-token`
4. enforce expiry and revocation checks from Prisma

Suggested model fields:
- `id`
- `token`
- `creatorId`
- `createdByUserId`
- `audience`
- `scope`
- `sponsorName`
- `partnerName`
- `expiresAt`
- `isRevoked`
- `includeBranding`
- `includeTopPosts`
- `includeCompletionRate`
- `includeWatchTime`
- `includeProducts`
- `allowedDomains`
- `createdAt`
- `updatedAt`

## Auth wiring

The pack uses bridge headers for now:
- `x-user-id`
- `x-user-role`

Replace `getShareActorFromHeaders()` with your real session lookup before production.

## URL behavior

- sponsor or partner summary: `/sponsor/analytics/share/[token]`
- partner-safe public snapshot: `/partner/analytics/snapshot/[token]`

## Recommended next step

Add a Prisma-backed token table and revoke/regenerate actions so sponsors and partners get controlled access instead of demo-mode token records.
