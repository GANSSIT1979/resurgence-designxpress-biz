# Runtime Verification

Updated: 2026-04-24
## Purpose

Use this checklist after the current creator-commerce feed, creator studio, and media rollout changes build successfully.

This runtime pass confirms that the live app still serves:

- homepage and public discovery routes
- login and support
- creator, member, sponsor, admin, and cashier shells
- official merch routes
- feed reads, feed analytics, and unauthenticated feed write guards
- support and health route visibility

This is a repeatable release procedure, not a standing guarantee for every branch or environment.

## Commands

Build first:

```bash
npm run build
```

Start the production server on a local port:

```bash
npx next start -p 3025
```

In a second terminal, run:

```bash
npm run runtime:verify -- --base-url=http://127.0.0.1:3025
npm run support:verify -- --base-url=http://127.0.0.1:3025
```

## Expected Results

- `runtime:verify` should pass public pages, protected shells, feed reads, shop reads, and unauthenticated feed-write guards
- `support:verify` should pass support routing checks
- `/api/health` should not report unexpected drift for the environment under test

## Notes

- the runtime verifier does not sign in as real users
- protected dashboards are verified as route availability checks, not real role-session acceptance tests
- feed write routes are expected to return `401` without auth during smoke verification
- if the current environment is intentionally behind on migrations, expect `/api/health` to report that explicitly
