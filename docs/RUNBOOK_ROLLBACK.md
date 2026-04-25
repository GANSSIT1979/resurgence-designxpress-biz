# Rollback Runbook

## When to Rollback

Rollback when:

- production health fails (database, schema, or API)
- deployment introduces regression
- critical endpoint is broken

## Step 1 — Identify Last Healthy Deployment

Use:

```bash
npx vercel list
```

Or check:

- PRODUCTION_STATUS.md
- Vercel dashboard

## Step 2 — Execute Rollback

Manual CLI:

```bash
npx vercel alias set <deployment-url> www.resurgence-dx.biz --scope resurgence-designxpress-projects
```

## Step 3 — Verify

```bash
curl https://www.resurgence-dx.biz/api/health
```

Must return:

- ok: true
- database: connected
- schema.status: ok

## Step 4 — Document Incident

- GitHub issue auto-created by monitoring
- add notes + root cause

## Notes

- Do NOT rollback blindly during transient latency spikes
- Always confirm deployment URL
- Prefer last known stable deployment
