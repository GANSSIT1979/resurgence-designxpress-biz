# Production Status

Last updated: 2026-04-25T07:26:08.911Z

## Canonical Production URL

- https://www.resurgence-dx.biz

## Health Check

Endpoint:

```txt
https://www.resurgence-dx.biz/api/health
```

Latest response:

```json
{
  "ok": true,
  "status": "ok",
  "database": "connected",
  "aiConfigured": true,
  "support": {
    "apiKeyConfigured": true,
    "workflowIdConfigured": true,
    "workflowVersionConfigured": true,
    "promptIdConfigured": true,
    "promptVersionConfigured": true,
    "webhookSecretConfigured": true,
    "chatkitReady": true,
    "webhookReady": true,
    "missing": []
  },
  "schema": {
    "status": "ok",
    "issues": []
  },
  "counts": {
    "users": 14,
    "sponsors": 4,
    "packages": 4
  }
}
```

## Current Status

| Area | Status |
|---|---|
| App | OK |
| Database | connected |
| Prisma schema | ok |
| AI configured | yes |
| ChatKit ready | yes |
| Webhook ready | yes |

## Counts

| Resource | Count |
|---|---:|
| Users | 14 |
| Sponsors | 4 |
| Packages | 4 |

## Verification Commands

```bash
curl -I https://www.resurgence-dx.biz
curl https://www.resurgence-dx.biz/api/health
npm run docs:check
```

## Notes

- Old Vercel log entries can reference previous deployment IDs. Verify against the active deployment before treating historical errors as current.
- Unsigned or manually posted requests to `/api/openai/webhook` may return `400` by design.
- Production runtime requires `DATABASE_URL`, `DIRECT_URL`, and `PRISMA_DB_PROVIDER=postgresql`.
