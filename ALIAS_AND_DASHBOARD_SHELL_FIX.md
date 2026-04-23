# Alias And Dashboard Shell Fix

Updated: 2026-04-24
## Status

Historical implementation note.

Environment/source-of-truth note: use [docs/CONFIGURATION.md](./docs/CONFIGURATION.md), [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md), and [docs/VERCEL.md](./docs/VERCEL.md) for current environment and rollout requirements.

## Current Accurate Summary

- `@/*` imports still resolve into `src/`.
- Shared dashboard shells are still part of the live admin, cashier, sponsor, staff, and partner experiences.
- Compatibility redirects remain for `/partner/dashboard`, `/admin/revenue-monitoring`, `/cashier/revenue-monitoring`, and nested sponsor dashboard pages.

## Canonical Docs

- `docs/ARCHITECTURE.md`
- `docs/ADMIN_GUIDE.md`
- `docs/USER_GUIDE.md`
