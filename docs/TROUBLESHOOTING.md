# TROUBLESHOOTING

Updated: 2026-04-19

## Prisma Client Or Provider Looks Wrong

Run:

```bash
npm run prisma:generate
```

Then restart the dev server or rebuild. This is especially important after changing `PRISMA_DB_PROVIDER`.

## Windows Prisma `EPERM` Rename Error

If Prisma fails with an error like:

```text
EPERM: operation not permitted, rename ...query_engine-windows.dll.node
```

stop any local `node.exe` or `next` processes that still have the Prisma engine open, then rerun the build or generate step.

## Support Verifier Returns `ECONNREFUSED`

The verifier does not start the app for you. Start the dev server or production server first, then run:

```bash
npm run support:verify -- --base-url=http://localhost:3000
```

## Support Readiness Looks Incomplete

Check `GET /api/health`. The `support` object is the easiest summary of:

- `OPENAI_API_KEY`
- `OPENAI_WORKFLOW_ID`
- `OPENAI_WEBHOOK_SECRET`

Add `OPENAI_WORKFLOW_VERSION` only if you want to pin a specific published workflow version.

## Webhook Signature Fails

- confirm the webhook targets `/api/openai/webhook`
- confirm the secret in `OPENAI_WEBHOOK_SECRET` matches the OpenAI project webhook
- rerun the verifier with `--webhook-secret=whsec_...` if you are not relying on `.env`

## Upload Fails

Check:

- file type is JPG, PNG, WEBP, or GIF
- file size is `5 MB` or smaller
- the signed-in user has access to the requested upload scope

## Session Or Login Looks Stale

Clear the `resurgence_admin_session` cookie for the local domain, then sign in again.
