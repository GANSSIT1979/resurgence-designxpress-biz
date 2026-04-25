# Creator Monetization And Affiliate System

## Core Flow

```text
Creator posts video -> Product tagged -> User watches -> User clicks -> Attribution stored -> Checkout -> Commission recorded
```

## MVP Models

- AffiliateLink
- AffiliateEvent
- Commission

## API Contracts

- POST /api/feed/:id/view
- POST /api/feed/:id/like
- POST /api/feed/:id/share
- POST /api/affiliate/events/click
- purchase attribution through Stripe/payment webhook

## Commission Logic

```text
commission = order_total * commission_rate
```

Default MVP rate: 10% (`1000` basis points).

## Security Rules

- calculate commissions server-side only
- never trust client-provided commission amounts
- verify payment webhooks
- keep payout approval admin-controlled
