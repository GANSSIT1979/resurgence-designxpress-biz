# Creator Monetization And Affiliate System

## Overview

Resurgence is not just a content platform. It is a creator commerce engine.

This system connects:

- creators (content producers)
- products (commerce layer)
- affiliates (distribution)
- platform (revenue engine)

---

## Core Flow

```text
Creator posts video
    ↓
Product is tagged
    ↓
User watches feed
    ↓
User clicks product
    ↓
Affiliate attribution captured
    ↓
Checkout completed
    ↓
Commission recorded
```

---

## Data Model (MVP)

### AffiliateLink

- id
- creatorId
- productId
- code (unique)
- createdAt

### AffiliateEvent

- id
- type (view | click | purchase)
- postId
- productId
- creatorId
- affiliateCode
- userId (nullable)
- metadata (json)
- createdAt

### Commission

- id
- creatorId
- productId
- orderId
- amount
- percentage
- status (pending | approved | paid)
- createdAt

---

## API Contracts

### Track View

POST /api/feed/:id/view

### Track Like

POST /api/feed/:id/like

### Track Share

POST /api/feed/:id/share

### Track Product Click

POST /api/affiliate/events/click

Body:

```json
{
  "postId": "",
  "productId": "",
  "creatorId": "",
  "affiliateCode": ""
}
```

### Track Purchase (server-side)

Triggered via:

- Stripe webhook
- GCash/Maya confirmation

---

## Attribution Rules

Priority:

1. explicit affiliate code
2. creatorId from post
3. last-click attribution (session)

---

## Commission Logic (MVP)

```text
commission = order_total * percentage
```

Defaults:

- platform fee: 10–20%
- creator share: configurable

---

## Mobile Integration

### Affiliate URL

```ts
buildAffiliateUrl({
  product,
  postId,
  creatorId,
  affiliateCode
})
```

### Event Tracking

- api.trackView(postId)
- api.trackProductClick(...)

---

## Creator Dashboard (Next Phase)

Metrics:

- total views
- clicks
- conversion rate
- revenue generated
- commissions earned

---

## Payout System (Next Phase)

- Stripe payouts
- GCash/Maya manual payouts
- threshold-based release

---

## Security Rules

- all commission calculation server-side
- no trust in client-provided amounts
- verify webhook signatures

---

## Future Extensions

- multi-tier affiliates
- referral trees (MLM-ready)
- coupon + affiliate hybrid tracking
- AI product recommendations in feed

---

## Summary

This system turns:

```text
Content → Traffic → Revenue
```

Into:

```text
Content → Engagement → Commerce → Commission → Growth Loop
```
