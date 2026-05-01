# SECURITY

Updated: 2026-05-01

## Current Security Baseline

- signed JWT session cookie authentication
- seeded users stored with hashed passwords
- middleware-based role protection for pages and APIs
- role permission matrix in `src/lib/permissions.ts`
- session-aware creator post and feed mutation routes
- upload scope checks on `/api/uploads/image`
- Cloudflare Stream direct-upload pattern for creator video instead of local disk storage
- signed webhook verification on `/api/openai/webhook`
- PayPal webhook verification on `/api/paypal/webhook` when `PAYPAL_WEBHOOK_ID` is configured
- server-side PayPal access token generation using `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`
- database guards on payment, invoice, feed, settings, and dashboard routes to avoid leaking Prisma initialization errors to users
- admin-only invoice and revenue dashboards for billing visibility

## Authentication Notes

- cookie name: `resurgence_admin_session`
- cookies are `httpOnly`
- `secure` is enabled automatically in production
- stale or invalid cookies should be cleared by logging out or clearing the browser cookie
- rotate `JWT_SECRET` for production and after any accidental exposure
- do not store plaintext admin passwords in environment variables; use a real bcrypt or Argon2 hash for `ADMIN_PASSWORD_HASH`

## Feed And Creator Notes

- creator post action routes use the real session and ownership checks
- comment, like, save, and share mutations are session-backed
- public view and watch-time analytics are lightweight and rollout-friendly, not anti-fraud-grade metrics
- creator publish actions still respect moderation boundaries

## Upload Notes

- image uploads accept JPG, PNG, WEBP, and GIF
- image uploads larger than `5 MB` are rejected
- creator video uploads are designed for Cloudflare Stream direct upload, not local disk
- only permitted roles can upload or mutate the allowed scopes
- production uploads should use Cloudflare Stream, R2, or another durable object/media store rather than Vercel local filesystem storage

## PayPal Billing And Invoice Notes

- PayPal is the primary online billing provider for sponsor checkout and invoice billing
- `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`, and all PayPal credentials must stay server-side only
- `PAYPAL_ENV` must be exactly `sandbox` or `live`; do not include inline comments in Vercel environment values
- sponsor PayPal order capture is performed server-side through `/api/sponsor/paypal/capture`
- PayPal invoice sending is performed server-side through `/api/invoice/paypal-send`
- PayPal webhook events are received through `/api/paypal/webhook`
- supported PayPal webhook events include `INVOICING.INVOICE.PAID` and `PAYMENT.CAPTURE.COMPLETED`
- invoice payment status should be updated only after server-side PayPal capture or verified webhook processing
- GCash references are manual payment records and should not be treated as confirmed payment until reviewed
- invoice metadata may contain PayPal invoice IDs, capture IDs, and webhook event references, but must not contain PayPal secrets
- revenue dashboards should be treated as internal/admin surfaces because they expose customer billing and sales pipeline data

## Webhook Notes

- keep `OPENAI_WEBHOOK_SECRET` private
- keep `PAYPAL_WEBHOOK_ID` private enough to avoid unnecessary spoofing attempts, even though it is not equivalent to a provider secret
- reject unsigned or invalid OpenAI webhook payloads
- verify PayPal webhook signatures through PayPal notification verification when `PAYPAL_WEBHOOK_ID` is configured
- do not treat webhook delivery as complete until the matching local database update succeeds
- webhook handlers should be idempotent or metadata-aware so duplicate provider events do not corrupt state

## Current Gaps

- no password reset flow yet
- no email verification flow yet
- no 2FA yet
- no comprehensive rate limiting yet
- no full billing audit-log subsystem yet
- PayPal webhook processing should be further hardened with stronger idempotency and event replay tracking
- unpaid invoice reminders are not yet rate-limited automation workflows
- lightweight analytics do not provide fraud-resistant view tracking
- broad audit coverage is improved but still not equivalent to a full enterprise audit subsystem

## Deployment Guidance

- rotate `JWT_SECRET`
- rotate any exposed provider secrets immediately, including OpenAI, Supabase service role, database, R2, PayPal, webhook, and admin secrets
- remove or change demo credentials before deployment
- move durable uploads away from local disk
- add monitoring around auth, feed mutations, support, finance, invoice creation, PayPal capture, and webhook delivery
- treat schema drift as a security and correctness risk because missing columns can bypass expected route behavior and health signals
- keep tracked docs and env examples placeholder-only; never commit real database hosts, project refs, password fragments, account numbers, API keys, webhook secrets, or provider secrets
- configure `DATABASE_URL` for pooled runtime access and `DIRECT_URL` for direct migration access when using Supabase
- redeploy Vercel with Build Cache OFF after Prisma, payment, or environment-variable changes
- test PayPal in sandbox before switching `PAYPAL_ENV` to `live`

## Environment Variable Handling

Server-only values must never be exposed with a `NEXT_PUBLIC_` prefix.

Server-only examples:

- `DATABASE_URL`
- `DIRECT_URL`
- `JWT_SECRET`
- `ADMIN_PASSWORD_HASH`
- `OPENAI_API_KEY`
- `OPENAI_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_SECRET_KEY`
- `R2_SECRET_ACCESS_KEY`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_WEBHOOK_ID`

Public values may use `NEXT_PUBLIC_` only when safe for browser exposure, such as public site name, contact info, and publishable/anon keys.

## Admin And Finance Guidance

- restrict `/admin`, `/admin/invoices`, and `/admin/revenue` to authorized internal users only
- avoid exposing customer email, invoice totals, payment status, sponsor package values, or revenue analytics to public routes
- manual payment changes should leave an audit trail with actor, reason, timestamp, and reference number when the audit subsystem is available
- sponsor approvals should be tied to a verified PayPal capture, verified PayPal invoice payment, or reviewed manual payment reference

## Support Guidance

- keep `OPENAI_WEBHOOK_SECRET` private
- reject unsigned or invalid webhook payloads
- only treat workflow publishing as complete after the verifier succeeds against the target environment
- never ask users to paste full secrets into support threads; request the last 4-6 characters or provider-side status screenshots with secrets redacted
- if a secret is pasted into chat, logs, or tickets, rotate it and update Vercel immediately
