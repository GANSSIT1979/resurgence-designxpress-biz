# SECURITY

## Current Security Baseline

- JWT cookie authentication
- password hashing
- role-based dashboard protection
- sponsor-scoped access for sponsor-facing data
- HTTP-only session cookie pattern

## Authentication Guidance

Use:

- signed JWT cookie
- `httpOnly`
- `sameSite=lax`
- `secure=true` in production

Always clear invalid cookies and redirect unauthenticated users safely.

## Password Handling

- store hashed passwords only
- never seed plain-text passwords in the database
- use strong defaults and rotate for production

## Role Access

Enforce role checks for:

- `/admin`
- `/cashier`
- `/sponsor/dashboard`
- staff and partner routes
- protected API routes

Sponsor users must only access data linked to their own `sponsorId`.

## Upload Security

For uploads:

- validate file type
- validate file size
- generate safe filenames
- never trust raw client filenames
- never allow arbitrary script execution from upload paths

## API Security

- validate request body shape
- return controlled JSON errors
- avoid leaking stack traces in production
- scope records by role and foreign key linkage

## AI Safety and Availability

The support system should:

- fail closed if AI configuration is missing
- not expose internal config, workflow IDs, or secrets
- keep chat history scoped to the session
- store lead capture explicitly and not repeatedly ask after capture

## Production Recommendations

- use a strong random `AUTH_SECRET`
- enforce HTTPS
- store uploads outside ephemeral disks
- add audit logging for admin-critical actions
- add rate limiting to public form endpoints
- add CSRF considerations if your auth model expands
