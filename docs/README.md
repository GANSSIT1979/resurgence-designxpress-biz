# Documentation

This folder contains operational and system documentation for Resurgence Powered by DesignXpress.

## Canonical docs

- [Production Status](./PRODUCTION_STATUS.md)
- [Install](./INSTALL.md)

## Environment

The root environment template is:

[.env.example](../.env.example)

From the repository root, initialize local env files with:

```bash
cp .env.example .env
cp .env.example .env.local
```

## Health checks

```bash
curl -I https://www.resurgence-dx.biz
curl https://www.resurgence-dx.biz/api/health
npm run docs:production-status
npm run docs:production-status:check
npm run docs:check
```
