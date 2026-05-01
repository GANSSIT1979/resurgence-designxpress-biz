# Production Status

Last verified: 2026-04-25

## Production URLs

- Website: https://www.resurgence-dx.biz
- Health endpoint: https://www.resurgence-dx.biz/api/health

## Latest confirmed deployment

Latest confirmed deployment observed:

```txt
dpl_F44gDR8MgE5R8VM8qd3xVgc8RKJv
```

Production deployment URL:

```txt
https://resurgence-designxpress-72i8flxo1.vercel.app
```

## Health check

Latest health response:

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
    "users": 15,
    "sponsors": 4,
    "packages": 4
  }
}
```

## Confirmed table checks

Required tables confirmed:

```json
[
  {
    "partner_table": ""Partner"",
    "sponsor_table": ""Sponsor"",
    "creator_profile_table": ""CreatorProfile""
  }
]
```

## Confirmed build status

Latest local build passed:

```txt
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (87/87)
✓ Collecting build traces
✓ Finalizing page optimization
```

## Confirmed payout routes

```txt
/admin/payouts
/api/admin/payouts
/api/admin/payouts/approve
/api/admin/payouts/mark-paid
/api/creator/earnings
/api/creator/payouts/request
/creator/earnings
```

## Standard smoke test

```bash
curl -I https://www.resurgence-dx.biz
curl https://www.resurgence-dx.biz/api/health
```

Expected:

```txt
HTTP/1.1 200 OK
```

and:

```json
{
  "ok": true,
  "database": "connected",
  "schema": {
    "status": "ok",
    "issues": []
  }
}
```
