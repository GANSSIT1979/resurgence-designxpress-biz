# TESTING

Updated: 2026-04-19

## Recommended Command Checks

### Bootstrap

```bash
npm install
npm run db:push
npm run db:seed
```

### Static Validation

```bash
npx tsc --noEmit --pretty false
npm run build
```

### Support Verification

Start the app first, then run:

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
- `/shop`
- `/api/health`

## Role Smoke Tests

- Admin can open `/admin`
- Cashier can open `/cashier`
- Sponsor can open `/sponsor/dashboard`
- Staff can open `/staff`
- Partner can open `/partner`

## Support Checks

- ask one sponsorship question
- ask one events question
- ask one custom apparel question
- ask one partnership question
- submit support lead details

## Current Verification Status

As of 2026-04-19:

- `npx tsc --noEmit --pretty false` passes
- `npm run build` passes
- `npm run support:verify` passes against a running local app
