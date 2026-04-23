# Login Fix Notes

Updated: 2026-04-23
## Status

Historical implementation note.

## Current Accurate Summary

- `/login` preserves `next` redirects for protected routes.
- The login page now builds cleanly in production with a Suspense-wrapped search-param flow.
- Session auth remains JWT-cookie based with the `resurgence_admin_session` cookie.

## Canonical Docs

- `docs/SECURITY.md`
- `docs/TROUBLESHOOTING.md`
- `docs/USER_GUIDE.md`
