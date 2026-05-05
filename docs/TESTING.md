# Testing

Updated: 2026-05-05

## Purpose

This document defines repeatable validation checks for RESURGENCE Powered by DesignXpress across local development, Vercel Preview, and Production.

## Standard Validation Commands

Run before commits that touch runtime code:

```bash
npm run type-check
npm run lint
npm run build
npx prisma migrate status
```

Expected result:

```txt
type-check passes
lint has warnings only or passes cleanly
build passes
Database schema is up to date
```

## Bootstrap Checks

For a fresh local setup:

```bash
npm install
npm run local:preflight
npm run prisma:generate
npm run db:push
npm run db:seed
npm run dev
```

If `local:preflight` is unavailable in a branch, run the standard validation commands and inspect `.env`, Prisma, and docs manually.

## Static Validation

```bash
npm run docs:check
npm run type-check
npm run lint
npm run build
```

If `docs:check` is unavailable, run Markdown link checks manually or defer the docs check to CI.

## Runtime Verification

Start the app first:

```bash
npm run dev
```

Then run, if scripts exist in the branch:

```bash
npm run runtime:verify -- --base-url=http://localhost:3000
npm run support:verify -- --base-url=http://localhost:3000
```

The runtime verifier should check public pages, protected shell availability, feed reads, shop reads, and unauthenticated write guards.

## Route Smoke Tests

Verify these pages load without fatal server errors:

- `/`
- `/feed`
- `/creators`
- `/creators/[slug]`
- `/creator/[slug]`
- `/login`
- `/member`
- `/creator/dashboard`
- `/creator/posts`
- `/creator/posts/new`
- `/shop`
- `/shop/product/[slug]`
- `/cart`
- `/checkout`
- `/account/orders`
- `/support`
- `/api/health`

## Auth Smoke Tests

- Password login works for a known test account.
- Google login renders the Google button when `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is configured.
- Google login posts credentials to `/api/auth/google`.
- Mobile OTP request works when OTP mode is configured.
- Role-based redirect lands on the correct dashboard.
- Logout clears the `resurgence_admin_session` cookie.

## Role Smoke Tests

- Admin can open `/admin`.
- Cashier can open `/cashier`.
- Sponsor can open `/sponsor/dashboard`.
- Creator can open `/creator/dashboard`.
- Staff can open `/staff`.
- Partner can open `/partner`.
- Member can open `/member`.
- Coach can open `/coach`.
- Referee can open `/referee`.

## Feed Checks

- Public feed reads succeed on `/` and `/feed`.
- Likes, saves, comments, and share flows degrade safely when signed out.
- Creator follow works when signed in.
- Comments modal opens and comment counts refresh.
- View counts and watch-time calls do not break feed rendering.
- Missing media uses stable fallback UI.

## Creator Workflow Checks

- Cloudflare direct upload route responds when env vars are present.
- Creator post create route can save a draft or review-bound post.
- Creator action routes enforce ownership rules.
- Creator edit route loads and updates metadata without type or schema errors.
- Published public posts render on `/feed` after moderation/publish rules are satisfied.

## Shop And Checkout Checks

- `/shop` loads active products.
- Product detail page loads by slug.
- Cart add, update, and remove works.
- Checkout creates a `ShopOrder`.
- Manual payment instructions render for GCash, Maya, bank transfer, card-manual, cash, and COD where configured.
- Order lookup works by checkout email.

## PayPal Billing Checks

Run in sandbox before live mode:

1. Create a sponsor application.
2. Start sponsor checkout through `/api/sponsor/checkout`.
3. Complete PayPal approval.
4. Capture through `/api/sponsor/paypal/capture`.
5. Create invoice through `/api/invoice/paypal-create`.
6. Send invoice through `/api/invoice/paypal-send`.
7. Pay invoice with a sandbox buyer.
8. Confirm `/api/paypal/webhook` updates local status.
9. Review `/admin/invoices` and `/admin/revenue`.

## Support Checks

Ask one question for each routing category:

- sponsorships
- orders
- payments
- events
- custom apparel
- partnerships

Submit a support lead and confirm `Inquiry`, notification, and automated email records are created or safely skipped depending on env configuration.

## Production Verification

```bash
curl -I https://www.resurgence-dx.biz
curl https://www.resurgence-dx.biz/api/health
```

Expected:

```txt
HTTP/1.1 200 OK
```

And health JSON should report database connectivity and no unexpected schema drift.
