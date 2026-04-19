# Deployment Guide

Updated: 2026-04-19

This root guide is the short deployment companion to `docs/DEPLOYMENT.md` and `docs/AI_SUPPORT_PRODUCTION.md`.

## Production Baseline

- Node.js 20.x
- `PRISMA_DB_PROVIDER=postgresql` and a production `DATABASE_URL` are recommended
- `JWT_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `FORCE_HTTPS=true`
- durable object storage if you do not want uploads on the app filesystem
- optional OpenAI and email webhook credentials if you are enabling support automation and outbound delivery

## Build And Release

```bash
npm install
npm run prisma:generate
npm run build
npm run start
```

HTTPS should be terminated by the deployment platform or a reverse proxy such as Caddy, Nginx, or Traefik. The app redirects HTTP to HTTPS for non-local hosts when `FORCE_HTTPS=true`.

## Optional AI Support Steps

- set `OPENAI_API_KEY`
- set `OPENAI_WORKFLOW_ID`
- optionally add `OPENAI_WORKFLOW_VERSION`
- set `OPENAI_WEBHOOK_SECRET`
- run `npm run support:verify -- --base-url=https://your-domain.example --webhook-secret=whsec_...`

## Current Note

As of 2026-04-19 the local production build is green. Real deployment readiness still depends on correct secrets, database connectivity, storage choices, and host configuration.

## Canonical References

- [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)
- [`docs/VERCEL.md`](./docs/VERCEL.md)
- [`docs/AI_SUPPORT_PRODUCTION.md`](./docs/AI_SUPPORT_PRODUCTION.md)
- [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md)
