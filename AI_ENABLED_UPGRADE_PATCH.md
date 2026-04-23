# AI Enabled Upgrade Patch

Updated: 2026-04-24
## Status

Historical implementation note.

Environment/source-of-truth note: use [docs/CONFIGURATION.md](./docs/CONFIGURATION.md), [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md), and [docs/VERCEL.md](./docs/VERCEL.md) for current environment and rollout requirements.

## Current Accurate Summary

- The live support flow is `/support`, `/api/chatkit/session`, `/api/chatkit/message`, `/api/chatkit/lead`, and `/api/openai/webhook`.
- The latest documented local verification on this branch included a green build and a passing support verifier against a running local app.
- OpenAI workflow publishing is still an external deployment step, not a local code blocker.

## Canonical Docs

- `README.md`
- `docs/API.md`
- `docs/AI_SUPPORT_PRODUCTION.md`
