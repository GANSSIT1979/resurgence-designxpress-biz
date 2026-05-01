# Deployment Runbook

Production deployment for RESURGENCE Powered by DesignXpress.

## Production

- Domain: https://www.resurgence-dx.biz
- Platform: Vercel
- Region: `sin1`
- Project: `resurgence-designxpress-biz`
- Team scope: `resurgence-designxpress-projects`

## Pre-deploy checks

Run:

```bash
npm run docs:check
npm run local:preflight
npm run vercel-build
```

Optional database sync:

```bash
npm run db:push
npm run prisma:generate
```

## Deploy

```bash
npx vercel --prod
```

Expected output:

```txt
Inspect: https://vercel.com/...
Production: https://resurgence-designxpress-xxxx.vercel.app
```

## Inspect deployment

```bash
npx vercel inspect <deployment-url>
```

Example:

```bash
npx vercel inspect resurgence-designxpress-r3k648gsb.vercel.app
```

Expected:

```txt
status      ● Ready
```

## Custom domain verification

```bash
curl -I https://www.resurgence-dx.biz
```

Expected:

```txt
HTTP/1.1 200 OK
Server: Vercel
X-Matched-Path: /
```

The `Set-Cookie` value may contain the active deployment ID:

```txt
_vcrr_...=dpl_xxxxx
```

## Health endpoint verification

```bash
curl https://www.resurgence-dx.biz/api/health
```

Expected:

```json
{
  "ok": true,
  "status": "ok",
  "database": "connected",
  "schema": {
    "status": "ok",
    "issues": []
  }
}
```

## Alias/domain command

If needed:

```bash
npx vercel alias set <deployment-url> www.resurgence-dx.biz --scope resurgence-designxpress-projects
```

Do not type angle brackets literally.

Correct:

```bash
npx vercel alias set resurgence-designxpress-r3k648gsb.vercel.app www.resurgence-dx.biz --scope resurgence-designxpress-projects
```

Incorrect:

```bash
npx vercel alias set <deployment> www.resurgence-dx.biz
```

## Final smoke test

```bash
curl -I https://www.resurgence-dx.biz
curl https://www.resurgence-dx.biz/api/health
curl -I https://www.resurgence-dx.biz/sponsors
curl -I https://www.resurgence-dx.biz/feed
```
