# SECURITY

Updated: 2026-05-05

Keep all secrets server-side. Never commit database URLs, PayPal secrets, OpenAI keys, R2 keys, webhook secrets, admin passwords, or bank details.

Google Auth uses `NEXT_PUBLIC_GOOGLE_CLIENT_ID` client-side and `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` server-side. PayPal billing remains the active online payment provider.
