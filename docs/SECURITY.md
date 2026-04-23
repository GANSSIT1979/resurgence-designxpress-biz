# SECURITY

Updated: 2026-04-23
## Current Security Baseline

- signed JWT session cookie authentication
- seeded users stored with hashed passwords
- middleware-based role protection for pages and APIs
- role permission matrix in `src/lib/permissions.ts`
- session-aware creator post and feed mutation routes
- upload scope checks on `/api/uploads/image`
- signed webhook verification on `/api/openai/webhook`

## Authentication Notes

- cookie name: `resurgence_admin_session`
- cookies are `httpOnly`
- `secure` is enabled automatically in production
- stale or invalid cookies should be cleared by logging out or clearing the browser cookie
- rotate `JWT_SECRET` for production

## Feed And Creator Notes

- creator post action routes use the real session and ownership checks
- comment, like, save, and share mutations are session-backed
- public view and watch-time analytics are lightweight and rollout-friendly, not anti-fraud-grade metrics
- creator publish actions still respect moderation boundaries

## Upload Notes

- image uploads accept JPG, PNG, WEBP, and GIF
- image uploads larger than `5 MB` are rejected
- creator video uploads are designed for Cloudflare Stream direct upload, not local disk
- only permitted roles can upload or mutate the allowed scopes

## Current Gaps

- no password reset flow yet
- no email verification flow yet
- no 2FA yet
- no comprehensive rate limiting yet
- lightweight analytics do not provide fraud-resistant view tracking
- broad audit coverage is improved but still not equivalent to a full enterprise audit subsystem

## Deployment Guidance

- rotate `JWT_SECRET`
- remove or change demo credentials before deployment
- move durable uploads away from local disk
- add monitoring around auth, feed mutations, support, finance, and webhook delivery
- treat schema drift as a security and correctness risk because missing columns can bypass expected route behavior and health signals

## Support Guidance

- keep `OPENAI_WEBHOOK_SECRET` private
- reject unsigned or invalid webhook payloads
- only treat workflow publishing as complete after the verifier passes against the target environment
