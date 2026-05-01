# Payments API

## `POST /api/sponsor/checkout`

Creates a PayPal sponsor checkout order or records a manual GCash reference.

### PayPal request

```json
{
  "submissionId": "sponsor_submission_id",
  "paymentMethod": "PAYPAL"
}
```

### PayPal response

```json
{
  "orderId": "PAYPAL_ORDER_ID",
  "url": "https://www.paypal.com/checkoutnow?..."
}
```

### GCash request

```json
{
  "submissionId": "sponsor_submission_id",
  "paymentMethod": "GCASH",
  "referenceNumber": "GCASH_REFERENCE"
}
```

## `POST /api/sponsor/paypal/capture`

Captures an approved PayPal sponsor checkout order.

```json
{
  "orderId": "PAYPAL_ORDER_ID",
  "submissionId": "sponsor_submission_id"
}
```

Successful capture updates the sponsor submission to `APPROVED` and stores capture audit notes.

## Security

- Do not trust client-side payment status.
- Capture only from server-side API routes.
- Manual references require human review before approval.
