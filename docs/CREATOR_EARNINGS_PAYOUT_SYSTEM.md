# Creator Earnings Dashboard + Admin Payout System

## Purpose

This package completes the monetization loop:

```text
Engage -> Convert -> Earn -> Withdraw
```

It gives creators earnings visibility and gives admins a payout approval workflow.

## Files

```text
prisma/payout-schema-addition.prisma
src/lib/commission.ts
src/app/api/creator/earnings/route.ts
src/app/api/creator/payouts/request/route.ts
src/app/api/admin/payouts/route.ts
src/app/api/admin/payouts/approve/route.ts
src/app/api/admin/payouts/mark-paid/route.ts
```

## Required Existing Models

This package assumes the affiliate/commission system already exists:

- AffiliateEvent
- Commission
- AffiliateLink

## Prisma Setup

Copy the schema in:

```text
prisma/payout-schema-addition.prisma
```

into:

```text
prisma/schema.prisma
```

Then run:

```bash
npm run prisma:prepare
npx prisma migrate dev --schema prisma/schema.generated.prisma --name add_creator_payouts
npm run prisma:generate
```

For production:

```bash
npx prisma migrate deploy --schema prisma/schema.generated.prisma
```

## API Endpoints

### Creator Earnings

```http
GET /api/creator/earnings?creatorProfileId=CREATOR_ID
```

Returns:

```json
{
  "ok": true,
  "summary": {
    "totalCommissionCents": 0,
    "totalOrderAmountCents": 0,
    "totalOrders": 0,
    "pendingCommissionCents": 0,
    "approvedCommissionCents": 0,
    "paidCommissionCents": 0,
    "availableCents": 0,
    "views": 0,
    "clicks": 0,
    "shares": 0,
    "purchases": 0,
    "conversionRate": 0,
    "canRequestPayout": false
  }
}
```

### Request Payout

```http
POST /api/creator/payouts/request
```

Body:

```json
{
  "creatorProfileId": "CREATOR_ID",
  "payoutAccountId": "OPTIONAL_ACCOUNT_ID",
  "amountCents": 50000,
  "notes": "GCash payout request"
}
```

### Admin List Payouts

```http
GET /api/admin/payouts?status=REQUESTED
```

### Admin Approve Payout

```http
POST /api/admin/payouts/approve
```

Body:

```json
{
  "payoutRequestId": "PAYOUT_ID",
  "reviewedById": "ADMIN_USER_ID"
}
```

### Admin Mark Paid

```http
POST /api/admin/payouts/mark-paid
```

Body:

```json
{
  "payoutRequestId": "PAYOUT_ID",
  "referenceNumber": "GCASH_TXN_123",
  "notes": "Paid manually via GCash"
}
```

## Recommended Admin Workflow

```text
REQUESTED -> UNDER_REVIEW -> APPROVED -> PAID
```

This starter implements:

```text
REQUESTED -> APPROVED -> PAID
```

Add UNDER_REVIEW and REJECTED UI controls in the admin panel later.

## Security Notes

Before production, add:

- RBAC checks on all admin routes
- creator ownership check on creator routes
- audit logging on payout approval and payment
- minimum payout threshold
- fraud review for suspicious affiliate activity

## Environment Variables

```env
MIN_CREATOR_PAYOUT_CENTS=50000
```

Default is 50000 cents = PHP 500.
