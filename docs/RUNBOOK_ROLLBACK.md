# Rollback Runbook

## When to rollback

Rollback when production health fails repeatedly, schema breaks, or a critical route regresses.

## CLI rollback

```bash
npx vercel alias set <deployment-url> www.resurgence-dx.biz --scope resurgence-designxpress-projects
```

## Verify

```bash
curl https://www.resurgence-dx.biz/api/health
```

Expected:

- ok: true
- database: connected
- schema.status: ok
