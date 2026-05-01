# Payments Documentation

RESURGENCE is PayPal-first for online sponsor checkout and invoice billing. GCash remains manual/reference-based.

## Primary docs

- `../PAYPAL_BILLING_SYSTEM.md` - full PayPal billing runbook
- `../SECURITY.md` - payment and webhook security guidance
- `../TROUBLESHOOTING.md` - known payment/build/runtime fixes

## Active PayPal flows

### Sponsor checkout

1. Sponsor submits application.
2. Sponsor starts PayPal checkout through `/api/sponsor/checkout`.
3. PayPal redirects back to `/payment/success`.
4. `/api/sponsor/paypal/capture` captures the order.
5. Sponsor submission is marked `APPROVED` after successful capture.

### Invoice billing

1. Admin creates invoice through `/api/invoice/paypal-create`.
2. Admin sends invoice through `/api/invoice/paypal-send`.
3. Customer pays through PayPal.
4. PayPal sends webhook to `/api/paypal/webhook`.
5. Local invoice is marked `PAID`.

## Required environment variables

```env
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_ENV=sandbox
PAYPAL_CURRENCY=PHP
PAYPAL_SPONSOR_AMOUNT=1000.00
PAYPAL_WEBHOOK_ID=WH_your_webhook_id
NEXT_PUBLIC_BASE_URL=https://www.resurgence-dx.biz
```

Use sandbox until checkout, invoice send, payment, webhook sync, and dashboards are verified end to end.
