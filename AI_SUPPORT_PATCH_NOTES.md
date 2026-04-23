# AI Support Patch Notes

Updated: 2026-04-24
## Status

Historical implementation note.

Environment/source-of-truth note: use [docs/CONFIGURATION.md](./docs/CONFIGURATION.md), [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md), and [docs/VERCEL.md](./docs/VERCEL.md) for current environment and rollout requirements.

## Current Accurate Summary

- `/api/chatkit/message` is the live rule-based support router for sponsorships, events, custom apparel, and partnerships.
- `/api/chatkit/lead` writes `Inquiry`, notification, and automated email records for support follow-up.
- `npm run support:verify` is the supported smoke-test command for this flow.

## Canonical Docs

- `README.md`
- `docs/API.md`
- `docs/AI_SUPPORT_PRODUCTION.md`
- `docs/TROUBLESHOOTING.md`
