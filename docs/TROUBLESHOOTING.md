# TROUBLESHOOTING

Updated: 2026-04-16

## Prisma Client Not Initialized

Run:

```bash
npm run prisma:generate
```

Then restart the dev server.

## Build Stops On `@/lib/sponsor-server`

Current known build stop:

```text
Module not found: Can't resolve '@/lib/sponsor-server'
```

This is a real repository blocker in `src/app/api/sponsor/profile/route.ts`. Restore or replace that helper before treating the build as deployment-ready.

## Typecheck Reports Many Legacy Errors

As of 2026-04-16, `npx tsc --noEmit` still reports legacy module drift, especially around:

- sponsor profile assumptions
- older cashier field names
- content and gallery delegate mismatches
- creator typing mismatches

Use the Prisma schema and active routes as the source of truth while repairing those files.

## OpenAI Support Returns Not Configured

Check:

- `OPENAI_API_KEY`
- `OPENAI_WORKFLOW_ID`
- `OPENAI_WEBHOOK_SECRET`

If you also want to pin a release, set `OPENAI_WORKFLOW_VERSION`.

## Webhook Signature Fails

- confirm the webhook targets `/api/openai/webhook`
- confirm the secret stored in `OPENAI_WEBHOOK_SECRET` matches the OpenAI project webhook
- rerun the verifier with `--webhook-secret=whsec_...`

## Support Route Classification Looks Wrong

Use the quick verification prompts in `/support` or run:

```bash
npm run support:verify -- --base-url=http://localhost:3000
```

## Session Or Login Looks Stale

Clear cookies for the local domain, then sign in again.
