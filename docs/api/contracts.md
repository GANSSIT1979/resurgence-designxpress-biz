# API Contracts

All JSON APIs should follow predictable request validation and response shapes.

## Success response

```json
{
  "success": true,
  "data": {}
}
```

Legacy routes may return direct objects while being migrated. New routes should prefer the envelope above.

## Error response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error",
    "details": {}
  }
}
```

## Validation principles

- Validate all request bodies server-side.
- Never trust client-provided totals, payment status, role, or user ownership.
- Use explicit enums for payment methods, invoice status, sponsor status, and provider names.
- Normalize money values as decimal strings or integer minor units before provider calls.

## Recommended Zod-style contracts

### Sponsor checkout

```ts
type SponsorCheckoutInput = {
  submissionId: string;
  paymentMethod: 'PAYPAL' | 'GCASH';
  referenceNumber?: string;
};
```

### PayPal capture

```ts
type PayPalCaptureInput = {
  orderId: string;
  submissionId?: string;
};
```

### Invoice create

```ts
type InvoiceCreateInput = {
  customerEmail: string;
  customerName?: string;
  items: Array<{
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
  }>;
  discount?: number;
  shipping?: number;
  tax?: number;
  otherAmount?: number;
};
```

### Invoice send

```ts
type InvoiceSendInput = {
  invoiceId: string;
};
```
