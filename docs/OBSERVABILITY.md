# Observability System

Updated: 2026-05-01

## Purpose

The observability layer gives RESURGENCE production visibility for API requests, PayPal payments, invoice events, sponsor funnel tracking, webhook delivery, alerts, revenue metrics, and admin troubleshooting.

## Runtime Components

- `src/lib/api/logger.ts` - structured JSON logging, request IDs, redaction, and audit events
- `src/lib/api/handler.ts` - API wrapper with request lifecycle logging, validation hooks, RBAC hooks, and standardized responses
- `src/lib/observability/alerts.ts` - alert helpers for payment and webhook failures
- `src/lib/observability/metrics.ts` - revenue, conversion, and funnel metrics helpers
- `src/lib/observability/store.ts` - safe persistence helpers for logs, alerts, and metrics
- `/admin/observability` - internal dashboard for logs, alerts, metrics, charts, and slow route visibility

## Dashboard

Route:

```txt
/admin/observability
```

The dashboard shows:

- total persisted logs
- error and warning counts
- critical alerts
- revenue metrics
- funnel and conversion metrics
- revenue trend bars
- log severity distribution
- funnel breakdown
- conversion breakdown
- slowest route average latency
- recent alerts
- recent metrics
- recent API logs with request IDs

## Prisma Models

Add these models to `prisma/schema.prisma` before expecting persistence:

```prisma
model ObservabilityLog {
  id           String   @id @default(cuid())
  level        String
  event        String
  requestId    String?
  route        String?
  method       String?
  status       Int?
  durationMs   Int?
  actorId      String?
  actorRole    String?
  resourceType String?
  resourceId   String?
  provider     String?
  metadataJson Json?
  createdAt    DateTime @default(now())

  @@index([event, createdAt])
  @@index([requestId])
  @@index([route, createdAt])
}

model ObservabilityMetric {
  id        String   @id @default(cuid())
  name      String
  value     Float?
  tagsJson  Json?
  createdAt DateTime @default(now())

  @@index([name, createdAt])
}

model ObservabilityAlert {
  id           String   @id @default(cuid())
  severity     String
  title        String
  message      String
  requestId    String?
  route        String?
  provider     String?
  resourceType String?
  resourceId   String?
  metadataJson Json?
  createdAt    DateTime @default(now())

  @@index([severity, createdAt])
}
```

Then run:

```bash
npm run db:push
npm run prisma:generate
```

## Logging Rules

- Every wrapped API route emits lifecycle events such as `api.request.start`, `api.request.finish`, `api.request.validation_failed`, `api.request.forbidden`, and `api.request.error`.
- Every response from the wrapper includes `x-request-id`.
- Logs are written to Vercel logs immediately.
- Persistence is best-effort and safely skipped if the Prisma models are not available yet.

## Redaction Rules

The logger redacts common secret-bearing keys such as:

- `secret`
- `password`
- `token`
- `authorization`
- `cookie`
- `client_secret`
- `access_token`

Do not log raw request bodies for payment, auth, or webhook routes.

## Metrics

Use metrics for:

- `revenue.recorded`
- `conversion.invoice_sent`
- `conversion.invoice_paid`
- `conversion.payment_success`
- `funnel.sponsor_landing`
- `funnel.sponsor_form_submit`
- `funnel.checkout_started`
- `funnel.payment_completed`

## Alerts

Use alerts for:

- PayPal capture failures
- PayPal webhook verification or processing failures
- database unavailable events on critical billing routes
- repeated admin/payment API failures

Optional external delivery uses:

```env
ALERT_WEBHOOK_URL=https://your-alert-webhook.example
```

If `ALERT_WEBHOOK_URL` is missing, alerts still log locally and can persist to the database when the model exists.

## Production Verification

1. Deploy latest app.
2. Push observability models with `npm run db:push`.
3. Regenerate Prisma Client with `npm run prisma:generate`.
4. Trigger any API route using `withApiHandler`.
5. Visit `/admin/observability`.
6. Confirm logs and charts appear.

If the dashboard says observability tables are unavailable, the code is deployed but the database schema is not yet synced.
