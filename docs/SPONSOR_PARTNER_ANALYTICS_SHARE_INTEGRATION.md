# Sponsor And Partner Analytics Share Integration

Updated: 2026-05-05

## Purpose

This document defines the sponsor/partner-safe analytics share layer for RESURGENCE Powered by DesignXpress. It sits on top of the existing creator analytics, sponsor summary, and partner-safe reporting surfaces.

## Current Status

This is a controlled integration path, not a fully production-persistent feature by default. The uploaded pack includes share pages, summary cards, token manager UI, and sponsor/partner-safe snapshot components. Production use requires Prisma-backed token persistence, real session authorization, expiry checks, and revocation.

## Current System Alignment

The integration must follow the current RESURGENCE architecture:

- Next.js 15 App Router
- Route handlers under `src/app/api`
- Prisma-backed PostgreSQL through Supabase in hosted environments
- Auth through the `resurgence_admin_session` cookie and server-side session helpers
- Creator analytics and sponsor-safe analytics built from the live creator/content-post data layer
- Admin, sponsor, partner, creator, staff, and system-admin access controlled by middleware and the permission matrix

## Proposed Routes

API routes:

```txt
POST /api/sponsor/analytics/share-token
GET /api/sponsor/analytics/share/[token]
```

Page routes:

```txt
/sponsor/analytics/share/[token]
/partner/analytics/snapshot/[token]
```

## Proposed Files

```txt
src/app/api/sponsor/analytics/share-token/route.ts
src/app/api/sponsor/analytics/share/[token]/route.ts
src/app/sponsor/analytics/share/[token]/page.tsx
src/app/partner/analytics/snapshot/[token]/page.tsx
src/components/resurgence/SponsorAnalyticsShareCard.tsx
src/components/resurgence/SponsorSnapshotPrintView.tsx
src/components/resurgence/PartnerSafeAnalyticsSnapshot.tsx
src/components/resurgence/AnalyticsShareTokenManager.tsx
src/components/resurgence/SponsorAnalyticsSharePage.tsx
src/components/resurgence/PartnerSafeAnalyticsSnapshotPage.tsx
src/lib/sponsor-analytics-share/types.ts
src/lib/sponsor-analytics-share/auth.ts
src/lib/sponsor-analytics-share/tokens.ts
src/lib/sponsor-analytics-share/buildSnapshot.ts
```

## Required Production Persistence

Before public production access, add a Prisma model for share tokens. Suggested model name:

```prisma
model CreatorAnalyticsShareToken {
  id                    String   @id @default(cuid())
  token                 String   @unique
  creatorProfileId      String
  createdByUserId       String
  audience              String
  scope                 String
  sponsorName           String?
  partnerName           String?
  expiresAt             DateTime
  revokedAt             DateTime?
  includeBranding       Boolean  @default(true)
  includeTopPosts       Boolean  @default(true)
  includeCompletionRate Boolean  @default(true)
  includeWatchTime      Boolean  @default(false)
  includeProducts       Boolean  @default(false)
  allowedDomainsJson    Json?
  metadataJson          Json?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([creatorProfileId])
  @@index([createdByUserId])
  @@index([expiresAt])
  @@index([revokedAt])
}
```

## Auth Requirements

Do not use bridge headers such as `x-user-id` or `x-user-role` in production. Replace demo header helpers with the repo's real session lookup and permission checks.

Allowed token creation actors should be limited to:

- the owning creator
- sponsor/partner users with explicit access
- staff
- system admin

Public token reads must enforce:

- token exists
- token is not expired
- token is not revoked
- token scope allows the requested page
- optional allowed-domain rules when configured

## Token Rules

- Generate high-entropy, unguessable tokens server-side.
- Store only one canonical token record per share link.
- Support revocation and regeneration.
- Do not expose internal creator, sponsor, invoice, or user IDs in public payloads unless needed.
- Keep sponsor/partner pages partner-safe by default.

## Data Safety

Public share payloads must avoid exposing:

- customer emails
- private order details
- admin notes
- payout details
- internal sponsor CRM notes
- raw event logs
- private user identifiers

Allowed share payloads may include:

- creator display name
- reporting period
- total views
- unique views
- completed views
- completion rate
- top public posts
- public thumbnails
- partner-safe sponsor summary

## Build Verification

Run:

```bash
npm run type-check
npm run lint
npm run build
npx prisma migrate status
```

Expected:

```txt
type-check passes
lint has warnings only or passes cleanly
build passes
Database schema is up to date
```

## Deployment Notes

- Apply Prisma schema changes to Preview before trusting token routes.
- Smoke-test sponsor and partner share pages with a short-lived token.
- Confirm expired and revoked tokens fail safely.
- Confirm public token pages do not require normal dashboard authentication.
- Confirm token creation remains protected.

## Next Implementation Step

Add the Prisma-backed token model, replace demo token behavior, and wire token creation to the real session/permission layer before exposing sponsor or partner share links outside the team.
