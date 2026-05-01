# Webhooks API

## `POST /api/paypal/webhook`

Receives PayPal webhook events.

### Supported events

- `INVOICING.INVOICE.PAID`
- `PAYMENT.CAPTURE.COMPLETED`

### Behavior

- verifies webhook when configured
- updates invoice or sponsor payment status
- stores event metadata for traceability

### Security

- reject invalid or unsigned payloads
- ensure idempotency (duplicate events should not corrupt state)

---

## `POST /api/openai/webhook`

Receives OpenAI workflow events.

### Security

- must validate `OPENAI_WEBHOOK_SECRET`
- reject unsigned payloads
