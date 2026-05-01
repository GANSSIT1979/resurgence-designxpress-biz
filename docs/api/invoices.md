# Invoice API

## `POST /api/invoice/paypal-preview`

Calculates totals before saving an invoice.

```json
{
  "items": [{ "name": "Jersey", "quantity": 12, "unitPrice": 900 }],
  "discount": 0,
  "shipping": 0
}
```

## `POST /api/invoice/paypal-create`

Creates a local invoice and stores items.

### Request

```json
{
  "customerEmail": "client@email.com",
  "items": [...],
  "discount": 0,
  "shipping": 0
}
```

### Behavior

- stores invoice in database
- sets status = `DRAFT`

## `POST /api/invoice/paypal-send`

Sends invoice through PayPal.

### Request

```json
{
  "invoiceId": "local_invoice_id"
}
```

### Behavior

- creates PayPal invoice
- sends to customer email
- updates status = `SENT`

## Status lifecycle

```txt
DRAFT → SENT → PAID
```

## Security

- Invoice status should only be updated after PayPal confirmation or webhook.
- Do not allow client-side overrides of totals or status.
