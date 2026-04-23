# TESTING

Updated: 2026-04-24
## Recommended Command Checks

### Bootstrap

```bash
npm install
npm run local:preflight
npm run db:push
npm run db:seed
```

### Static Validation

```bash
npm run docs:check
npx tsc --noEmit --pretty false
npm run build
```

### Runtime And Support Verification

Start the app first, then run:

```bash
npm run runtime:verify -- --base-url=http://localhost:3000
npm run support:verify -- --base-url=http://localhost:3000
```

## Route Smoke Tests

Verify these pages load:

- `/`
- `/feed`
- `/creators/jake-anilao`
- `/login`
- `/member`
- `/creator/dashboard`
- `/creator/posts`
- `/creator/posts/new`
- `/shop`
- `/shop/product/resurgence-black-jersey`
- `/cart`
- `/checkout`
- `/account/orders`
- `/support`
- `/api/health`

## Role Smoke Tests

- Admin can open `/admin`
- Cashier can open `/cashier`
- Sponsor can open `/sponsor/dashboard`
- Creator can open `/creator/dashboard`
- Staff can open `/staff`
- Partner can open `/partner`
- Member can open `/member`

## Feed Checks

- public feed reads succeed on `/` and `/feed`
- likes, saves, comments, and share flows degrade safely when signed out
- creator follow works when signed in
- comments modal opens and comment counts refresh
- share counts, view counts, and watch-time tracking do not break feed rendering

## Creator Workflow Checks

- Cloudflare direct upload route responds when env vars are present
- creator post create route can save a draft or review-bound post
- creator action routes respond with the correct ownership rules
- creator edit route loads and updates metadata without type or schema errors

## Support Checks

- ask one sponsorship question
- ask one events question
- ask one custom apparel question
- ask one partnership question
- submit support lead details

## Latest Documented Branch Verification

As of 2026-04-24:

- `npm run local:preflight` passes
- `npm run docs:check` passes
- `npx tsc --noEmit --pretty false` passes
- `npm run build` passes

Rerun static, runtime, and support checks on the branch and environment you actually plan to ship.
