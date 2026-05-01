# PayPal Billing System

## Status

RESURGENCE Powered by DesignXpress is PayPal-first for sponsor payments, invoice billing, payment capture, webhook sync, and admin revenue analytics.

Stripe is no longer the active billing provider for new payment flows. Do not add new Stripe endpoints or Stripe environment variables unless a deliberate multi-provider strategy is approved.

## Production Capabilities

### Sponsor Checkout

Sponsor checkout creates a PayPal order and redirects the payer to PayPal approval.

Endpoint:

```http
POST /api/sponsor/checkout
```

Supported payment methods:

- `PAYPAL`
- `GCASH` for manual/reference-based payments

PayPal checkout flow:

1. Sponsor application is submitted.
2. Sponsor selects PayPal payment.
3. `/api/sponsor/checkout` creates a PayPal order.
4. User is redirected to PayPal.
5. PayPal redirects back to `/payment/success`.
6. `/payment/success` calls `/api/sponsor/paypal/capture`.
7. Capture updates sponsor submission status to `APPROVED`.

### PayPal Capture

Endpoint:

```http
POST /api/sponsor/paypal/capture
```

Payload:

```json
{
  "orderId": "PAYPAL_ORDER_ID",
  "submissionId": "SPONSOR_SUBMISSION_ID"
}
```

Behavior:

- Captures the PayPal order server-side.
- Extracts PayPal order/capture metadata.
- Updates sponsor submission to `APPROVED`.
- Stores capture audit details in internal notes.

### PayPal Invoice Preview

Endpoint:

```http
POST /api/invoice/paypal-preview
```

Payload:

```json
{
  "items": [
    { "name": "Basketball Jersey Set", "quantity": 12, "unitPrice": 900 }
  ],
  "discount": 0,
  "shipping": 0,
  "otherAmount": 0,
  "tax": 0
}
```

Formula:

```txt
subtotal = sum(quantity * unitPrice)
total = subtotal - discount + shipping + otherAmount + tax
```

### PayPal Invoice Create

Endpoint:

```http
POST /api/invoice/paypal-create
```

Behavior:

- Validates invoice items and customer email.
- Calculates totals.
- Generates invoice number using `DX-YYYYMMDD-XXXXXX` format.
- Saves invoice and invoice items to PostgreSQL through Prisma.
- Stores PayPal invoice metadata-ready data in `metadataJson`.

### PayPal Invoice Send

Endpoint:

```http
POST /api/invoice/paypal-send
```

Payload:

```json
{
  "invoiceId": "LOCAL_INVOICE_ID"
}
```

Behavior:

1. Loads local invoice and line items.
2. Creates a PayPal invoice draft through PayPal Invoicing API.
3. Sends the PayPal invoice to the customer.
4. Updates local invoice status to `SENT`.
5. Stores `paypalInvoiceId` in `metadataJson`.

### PayPal Webhook

Endpoint:

```http
POST /api/paypal/webhook
```

Configure this URL in PayPal Developer Dashboard:

```txt
https://www.resurgence-dx.biz/api/paypal/webhook
```

Subscribed events:

- `INVOICING.INVOICE.PAID`
- `PAYMENT.CAPTURE.COMPLETED`

Behavior:

- Verifies PayPal webhook signatures when `PAYPAL_WEBHOOK_ID` is configured.
- Matches PayPal invoice/capture IDs to local invoice metadata.
- Updates invoice status to `PAID`.
- Stores event details in `metadataJson`.

## Admin Dashboards

### Invoice Dashboard

```txt
/admin/invoices
```

Shows:

- Total invoices
- Paid revenue
- Outstanding balance
- Invoice table with customer, status, item count, subtotal, total, and created date

### Revenue Dashboard

```txt
/admin/revenue
```

Shows:

- Paid revenue
- Outstanding revenue
- Invoice conversion rate
- Sponsor conversion rate
- Invoice pipeline counts
- Sponsor funnel counts
- Unpaid invoice alerts
- Recent paid invoices

## Required Environment Variables

```env
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_ENV=sandbox
PAYPAL_CURRENCY=PHP
PAYPAL_SPONSOR_AMOUNT=1000.00
PAYPAL_WEBHOOK_ID=WH_your_webhook_id
NEXT_PUBLIC_BASE_URL=https://www.resurgence-dx.biz
```

Use `PAYPAL_ENV=live` only with live PayPal credentials.

Do not include inline comments in Vercel values. Use:

```env
PAYPAL_ENV=sandbox
```

Not:

```env
PAYPAL_ENV=sandbox # or live
```

## Database Requirements

The billing system expects a valid PostgreSQL `DATABASE_URL` and Prisma models for invoices and invoice items.

Recommended Supabase configuration:

```env
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true
DIRECT_URL=postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres?sslmode=require
```

## Deployment Checklist

1. Rotate any exposed secrets before production deployment.
2. Configure PayPal app credentials in Vercel.
3. Configure PayPal webhook URL and selected events.
4. Add `PAYPAL_WEBHOOK_ID` to Vercel.
5. Confirm `DATABASE_URL` and `DIRECT_URL` are correct.
6. Redeploy with Vercel Build Cache OFF.
7. Test sandbox invoice creation, send, payment, and webhook status update.

## Test Flow

1. Create invoice using `/api/invoice/paypal-create`.
2. Send invoice using `/api/invoice/paypal-send`.
3. Pay invoice from PayPal sandbox buyer account.
4. Confirm webhook updates local invoice to `PAID`.
5. Review `/admin/revenue` and `/admin/invoices`.

## Operational Notes

- `metadataJson` stores PayPal IDs and event references.
- Webhook processing is designed to fail safely if DB/env is missing.
- Revenue dashboards are defensive against schema drift and missing delegates.
- GCash remains manual/reference-based.
