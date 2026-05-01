# API Documentation

This folder documents the active RESURGENCE API surfaces.

## Payment and billing APIs

| Endpoint | Purpose |
|---|---|
| `POST /api/sponsor/checkout` | Create PayPal sponsor checkout orders or record manual GCash references |
| `POST /api/sponsor/paypal/capture` | Capture approved PayPal sponsor orders server-side |
| `POST /api/invoice/paypal-preview` | Calculate PayPal-style invoice totals before saving |
| `POST /api/invoice/paypal-create` | Save local invoice and invoice items |
| `POST /api/invoice/paypal-send` | Create and send a PayPal invoice from a local invoice |
| `POST /api/paypal/webhook` | Receive PayPal invoice/payment events and sync invoice status |

## Platform APIs

| Endpoint | Purpose |
|---|---|
| `GET /api/health` | Production health check |
| `POST /api/media/cloudflare/direct-upload` | Create Cloudflare Stream direct-upload sessions |
| `POST /api/creator/posts/create` | Save creator posts |
| `POST /api/openai/webhook` | Receive signed OpenAI workflow webhook events |

## API security rules

- Keep provider secrets server-side.
- Do not expose payment, invoice, or admin APIs without role/session checks where required.
- Webhook routes must verify provider signatures when configured.
- Payment state should change only after server-side capture, verified webhook processing, or reviewed manual payment action.
