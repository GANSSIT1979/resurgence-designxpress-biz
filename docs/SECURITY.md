# SECURITY

Updated: 2026-04-19

## Current Security Baseline

- signed JWT session cookie authentication
- seeded users stored with hashed passwords
- middleware-based role protection for pages and APIs
- role permission matrix in `src/lib/permissions.ts`
- sponsor, partner, staff, and cashier routes scoped by current session context
- upload scope checks on `/api/uploads/image`
- signed webhook verification on `/api/openai/webhook`

## Authentication Notes

- cookie name: `resurgence_admin_session`
- cookies are `httpOnly`
- `secure` is enabled automatically in production
- stale or invalid cookies should be cleared by logging out or clearing the browser cookie
- rotate `JWT_SECRET` for production

## Upload Notes

- only JPG, PNG, WEBP, and GIF are accepted
- files larger than `5 MB` are rejected
- only permitted roles can upload specific scopes

## Current Gaps

- no password reset flow yet
- no email verification flow yet
- no 2FA yet
- no comprehensive rate limiting yet
- `/api/activity-logs` is present, but broad audit coverage is still limited compared with a full audit subsystem

## Deployment Guidance

- rotate `JWT_SECRET`
- remove or change demo credentials before deployment
- move uploads away from local disk if you need durable storage
- add monitoring around auth, support, finance, and email webhook delivery

## Support Guidance

- keep `OPENAI_WEBHOOK_SECRET` private
- reject unsigned or invalid webhook payloads
- only treat workflow publishing as complete after the verifier passes against the target environment
