# TESTING

Updated: 2026-04-16

## Recommended Command Checks

### Local Bootstrap

```bash
npm install
npm run prisma:generate
npm run db:push
npm run db:seed
```

### Support Verification

```bash
npm run support:verify -- --base-url=http://localhost:3000
```

## Route Smoke Tests

Verify these pages load:

- `/`
- `/login`
- `/contact`
- `/sponsor/apply`
- `/support`
- `/api/health`

## Role Smoke Tests

- Admin can open `/admin`
- Cashier can open `/cashier`
- Sponsor can open `/sponsor/dashboard`
- Staff can open `/staff`
- Partner can open `/partner`

## AI Support Checks

- ask one sponsorship question
- ask one events question
- ask one custom apparel question
- ask one partnership question
- save lead details through the support lead form

## Current Verification Status

As of 2026-04-16:

- targeted support-route documentation and route wiring were updated
- `npx tsc --noEmit` still fails in unrelated legacy modules
- `npm run build` still fails on the missing `@/lib/sponsor-server` import

That means focused feature testing can continue, but repository-wide green verification is still pending.
