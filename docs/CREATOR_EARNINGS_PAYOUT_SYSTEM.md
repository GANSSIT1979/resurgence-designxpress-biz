# Creator Earnings and Payout System

Creator earnings and payout workflow for RESURGENCE Powered by DesignXpress.

## Purpose

The creator earnings and payout system tracks creator monetization from affiliate activity, commissions, creator content, sponsor performance, and payout requests.

It supports:

- Creator earnings dashboard
- Creator payout request API
- Admin payout review
- Admin payout approval
- Admin mark-paid workflow
- Affiliate links and commission tracking
- Payout status lifecycle
- Production-safe Prisma/PostgreSQL schema

## Key routes

Creator routes:

```txt
/creator/earnings
/api/creator/earnings
/api/creator/payouts/request
```

Admin routes:

```txt
/admin/payouts
/api/admin/payouts
/api/admin/payouts/approve
/api/admin/payouts/mark-paid
```

## Core Prisma models

Primary payout request model:

```prisma
model CreatorPayoutRequest {
  id                 String                     @id @default(cuid())
  creatorId          String?
  creatorProfileId   String?
  requestedAmount    Decimal                    @default(0) @db.Decimal(12, 2)
  amountCents        Int?
  approvedAmount     Decimal?                   @db.Decimal(12, 2)
  payoutAccountId    String?
  currency           String                     @default("PHP")
  status             CreatorPayoutRequestStatus @default(PENDING)

  provider           String?
  providerAccountId  String?
  providerTransferId String?
  referenceNumber    String?
  notes              String?
  rejectionReason    String?
  metadata           Json?

  requestedAt        DateTime                   @default(now())
  reviewedById       String?
  reviewedAt         DateTime?
  approvedAt         DateTime?
  rejectedAt         DateTime?
  processingAt       DateTime?
  paidAt             DateTime?
  failedAt           DateTime?

  createdAt          DateTime                   @default(now())
  updatedAt          DateTime                   @updatedAt

  @@index([creatorId])
  @@index([creatorProfileId])
  @@index([status])
  @@index([requestedAt])
  @@index([reviewedById])
  @@index([payoutAccountId])
  @@unique([providerTransferId])
}
```

Status enum:

```prisma
enum CreatorPayoutRequestStatus {
  REQUESTED
  UNDER_REVIEW
  PENDING
  APPROVED
  REJECTED
  PROCESSING
  PAID
  FAILED
  CANCELLED
}
```

Affiliate models:

```prisma
model AffiliateLink
model AffiliateEvent
model Commission
```

## Payout lifecycle

Recommended lifecycle:

```txt
REQUESTED
UNDER_REVIEW
APPROVED
PROCESSING
PAID
```

Rejection path:

```txt
REQUESTED
UNDER_REVIEW
REJECTED
```

Failure path:

```txt
APPROVED
PROCESSING
FAILED
```

Cancellation path:

```txt
REQUESTED
CANCELLED
```

## Creator payout request flow

1. Creator opens `/creator/earnings`
2. Creator submits request to `/api/creator/payouts/request`
3. API creates `CreatorPayoutRequest`
4. Admin reviews via `/admin/payouts`
5. Admin approves via `/api/admin/payouts/approve`
6. Admin marks paid via `/api/admin/payouts/mark-paid`

## Admin approval fields

Approval updates:

```txt
status
reviewedById
reviewedAt
approvedAt
approvedAmount
```

Paid updates:

```txt
status
paidAt
referenceNumber
providerTransferId
notes
```

## Validation expectations

The payout API expects fields compatible with:

```txt
creatorProfileId
payoutAccountId
amountCents
notes
status
```

The schema also keeps backward-compatible fields:

```txt
creatorId
requestedAmount
providerAccountId
```

## Build verification

Run:

```bash
npm run prisma:prepare
npx prisma validate --schema prisma/schema.generated.prisma
npm run prisma:generate
npm run vercel-build
```

Expected routes in build output:

```txt
/admin/payouts
/api/admin/payouts
/api/admin/payouts/approve
/api/admin/payouts/mark-paid
/api/creator/earnings
/api/creator/payouts/request
/creator/earnings
```

## Database sync

Current production-safe workflow:

```bash
npm run db:push
npm run prisma:generate
```

Avoid `migrate dev` until migration history is baselined.

## Production verification

```bash
curl -I https://www.resurgence-dx.biz
curl https://www.resurgence-dx.biz/api/health
```
