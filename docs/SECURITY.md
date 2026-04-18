# SECURITY

Updated: 2026-04-16

## Current Security Baseline

- JWT cookie authentication
- hashed seeded demo passwords
- role-based dashboard protection
- sponsor-scoped data access patterns
- admin-only and role-specific API checks in protected routes
- upload route gated by authenticated role checks
- OpenAI webhook signature verification on `/api/openai/webhook`

## Authentication Notes

- the session cookie should remain `httpOnly`
- `secure` should be enabled in production
- stale or invalid cookies should be cleared safely

## Current Gaps

- no password reset flow yet
- no email verification flow yet
- no 2FA yet
- no comprehensive rate limiting yet
- audit log coverage exists in places but schema integration is still incomplete

## Deployment Guidance

- rotate `AUTH_SECRET`
- remove all demo credentials from production
- move uploads away from local disk
- add monitoring and alerting around auth, support, and finance flows

## AI Support Guidance

- keep `OPENAI_WEBHOOK_SECRET` private
- reject unsigned or invalid webhook payloads
- do not treat workflow publishing as complete until the verifier passes against production
