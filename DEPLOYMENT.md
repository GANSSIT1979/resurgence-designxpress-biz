# Deployment Guide

Updated: 2026-04-16

This root guide is the short deployment companion to `docs/DEPLOYMENT.md` and `docs/AI_SUPPORT_PRODUCTION.md`.

## Production Baseline

- Node.js 20.x
- PostgreSQL
- strong `AUTH_SECRET`
- durable object storage for uploads
- OpenAI credentials only when enabling production AI support

## Required Steps

```bash
npm install
npm run prisma:generate
npm run build
```

## AI Support Steps

- publish the OpenAI workflow
- set `OPENAI_WORKFLOW_ID`
- optionally set `OPENAI_WORKFLOW_VERSION`
- create the OpenAI project webhook
- set `OPENAI_WEBHOOK_SECRET`
- run `npm run support:verify -- --base-url=https://your-domain.example --webhook-secret=whsec_...`

## Current Caveat

Do not treat deployment as ready until the repository-wide build blockers are repaired. The current first build stop is the missing `@/lib/sponsor-server` helper in the sponsor profile API route.

## Canonical References

- [`docs/DEPLOYMENT.md`](./docs/DEPLOYMENT.md)
- [`docs/AI_SUPPORT_PRODUCTION.md`](./docs/AI_SUPPORT_PRODUCTION.md)
- [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md)
