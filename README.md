# RESURGENCE Production Config Patch

This package contains production-safe configuration files for subdomain routing, HTTPS/security headers, and Vercel deployment.

## Files

```txt
middleware.ts                  -> root middleware re-export
src/middleware.ts              -> production subdomain/auth middleware
next.config.mjs                -> Next config with dev origins + security headers
vercel.json                    -> Vercel framework/build/region/cron config
env-templates/.env.example     -> sanitized env template, no real secrets
```

## Important

Do not commit real `.env`, `.env.local`, or Vercel-exported secret files. Real secrets must be stored in Vercel Environment Variables only.

## Install

Copy files into repo root preserving paths:

```bash
cp middleware.ts ./middleware.ts
cp src/middleware.ts ./src/middleware.ts
cp next.config.mjs ./next.config.mjs
cp vercel.json ./vercel.json
cp env-templates/.env.example ./.env.example
```

If your repo already has `next.config.js`, remove it or merge redirects into `next.config.mjs`. Do not keep both `next.config.js` and `next.config.mjs` unless your build is explicitly configured for that.

## Validate

```bash
npm run build
git add middleware.ts src/middleware.ts next.config.mjs vercel.json .env.example
git commit -m "Update production routing and config"
git push origin main
```

## Vercel env variables

Set at minimum:

```txt
NEXT_PUBLIC_ROOT_DOMAIN=resurgence-dx.biz
NEXT_PUBLIC_SITE_URL=https://www.resurgence-dx.biz
FORCE_HTTPS=true
DATABASE_URL=<production database url>
DIRECT_URL=<non-pooling database url>
JWT_SECRET=<strong secret>
```
