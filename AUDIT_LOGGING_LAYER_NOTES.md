# Audit Logging Layer Notes

Updated: 2026-04-23
## Status

Historical implementation note.

Environment/source-of-truth note: use [docs/CONFIGURATION.md](./docs/CONFIGURATION.md), [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md), and [docs/VERCEL.md](./docs/VERCEL.md) for current environment and rollout requirements.

## Current Accurate Summary

- `/api/activity-logs` still exists, but broad audit coverage is smaller than a full audit subsystem.
- Platform notifications and automated emails are the most visible workflow-tracking records in the current app.

## Canonical Docs

- `docs/SECURITY.md`
- `docs/DATABASE.md`
- `docs/ROADMAP.md`
