# Form Layer Premium Notes

Updated: 2026-04-24
## Status

Historical implementation note.

Environment/source-of-truth note: use [docs/CONFIGURATION.md](./docs/CONFIGURATION.md), [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md), and [docs/VERCEL.md](./docs/VERCEL.md) for current environment and rollout requirements.

## Current Accurate Summary

- Active public form flows include inquiries, sponsor submissions, support lead capture, and checkout.
- Image uploads now use `POST /api/uploads/image`.
- Dashboard forms remain backed by route handlers and Prisma validation schemas.

## Canonical Docs

- `docs/API.md`
- `docs/ADMIN_GUIDE.md`
- `docs/USER_GUIDE.md`
