# Route Verification Checklist

Use this checklist after each Vercel production deployment.

## Public routes

- [ ] `/`
- [ ] `/feed`
- [ ] `/creators`
- [ ] `/shop`
- [ ] `/shop/product/jake-anilao-creator-tee`
- [ ] `/sponsors`
- [ ] `/sponsor/apply`
- [ ] `/support`
- [ ] `/contact`

## Subdomain routes

- [ ] `https://www.resurgence-dx.biz/`
- [ ] `https://feed.resurgence-dx.biz/`
- [ ] `https://events.resurgence-dx.biz/`
- [ ] `https://shop.resurgence-dx.biz/`
- [ ] `https://partnership.resurgence-dx.biz/`
- [ ] `https://support.resurgence-dx.biz/`
- [ ] `https://login.resurgence-dx.biz/`
- [ ] `https://admin.resurgence-dx.biz/`
- [ ] `https://crm.resurgence-dx.biz/`

## Functional checks

- [ ] Header navigation links resolve.
- [ ] Mobile bottom navigation renders.
- [ ] Footer contact information renders.
- [ ] Product detail page renders purchase controls.
- [ ] Product options can be selected.
- [ ] Add-to-cart flow works.
- [ ] Creator directory search works.
- [ ] Creator profile links resolve.
- [ ] SEO metadata exists.
- [ ] OG/Twitter metadata exists.
- [ ] No route renders raw directory index.
- [ ] No route returns 404 unexpectedly.
- [ ] No route is stuck on loading state after hydration.

## Production safety checks

- [ ] No `.env` secret files are committed.
- [ ] Vercel environment variables are configured in Project Settings.
- [ ] Prisma client is generated during build.
- [ ] Database migrations are applied safely.
- [ ] Webhook secrets are configured for Stripe/PayPal.
- [ ] Middleware rewrites subdomains to the expected modules.
