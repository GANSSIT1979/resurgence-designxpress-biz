# Runtime Verification

Updated: 2026-04-20

## Purpose

Use this checklist after the stacked creator-commerce feed PRs build successfully.

This runtime pass confirms that the live app still serves:

- homepage and public discovery routes
- login and support
- creator, sponsor, admin, and cashier shells
- official merch routes
- feed reads and feed auth gates
- support desk route health

## Commands

Build first:

```bash
npm run build
```

Start the production server on a local port:

```bash
npx next start -p 3025
```

In a second terminal, run the runtime smoke verifier:

```bash
npm run runtime:verify -- --base-url=http://127.0.0.1:3025
```

Run support route verification:

```bash
npm run support:verify -- --base-url=http://127.0.0.1:3025
```

## Expected Results

- `runtime:verify` should pass public pages, protected shells, feed reads, shop reads, and unauthenticated feed write guards.
- `support:verify` should pass support routing checks.
- OpenAI webhook POST verification is skipped when the environment reports `webhookReady=false`.

## Notes

- The runtime verifier does not sign in as real users. Protected dashboards are verified as route availability checks, not role-session acceptance tests.
- Feed write routes are expected to return `401` without auth during smoke verification.
- `GET /api/uploads/image` is expected to return `405` because upload creation is not a GET operation.
