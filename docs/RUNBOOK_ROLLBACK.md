# Rollback Runbook

Updated: 2026-05-05

Rollback when Production health, auth, billing, feed, or schema safety fails. Prefer Vercel deployment rollback for code-only regressions and forward additive migrations for schema issues whenever safe.

## Verify

```bash
curl -I https://www.resurgence-dx.biz
curl https://www.resurgence-dx.biz/api/health
```
