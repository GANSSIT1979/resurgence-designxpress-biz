# Production Status

Updated: 2026-04-25

Canonical site: https://www.resurgence-dx.biz

Latest verified deployment:

```text
dpl_EMHduw5CD8eSk3NVZgCkR6tqBLWj
```

Verify:

```bash
curl -I https://www.resurgence-dx.biz
curl https://www.resurgence-dx.biz/api/health
curl -I https://www.resurgence-dx.biz/sponsors
```

Expected:

- HTTP 200 OK
- database connected
- schema OK
- support/chatkit/webhook ready

Ignore old Vercel DATABASE_URL errors from previous deployment IDs. Only investigate latest active deployment logs.
