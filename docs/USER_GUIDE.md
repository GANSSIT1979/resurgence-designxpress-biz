# User Guide

Updated: 2026-05-05

## What This Platform Is

RESURGENCE Powered by DesignXpress is a basketball-focused creator, commerce, sponsorship, support, and billing platform. It combines public discovery, creator content, official merch, sponsor workflows, PayPal-first billing, and protected role dashboards.

## Public Visitors

Without signing in, visitors can:

- browse the homepage
- explore `/feed`
- browse creators on `/creators` and creator profile pages
- browse official merch on `/shop`
- add items to `/cart` and complete `/checkout`
- look up orders on `/account/orders` using checkout email
- submit sponsor applications on `/sponsor/apply`
- access support on `/support`
- submit quotation or contact requests

## Account Creation

Open `/login` to:

- sign in with an existing account
- create an account with Google when configured
- create an account with mobile OTP when configured

Public signup roles include:

- Member
- Creator
- Coach
- Referee
- Sponsor
- Partner

After signup or login, the platform redirects users to the dashboard matching their role.

## Member Experience

Members use `/member` as their community home base.

The dashboard may show:

- merch order summary and lookup links
- followed creators
- saved posts
- notifications
- uploaded content tied to the account
- community highlights
- featured merch recommendations

Merch order history remains tied to the checkout email, not a full server-owned cart/account-order model.

## Creator Experience

Creators can access:

```txt
/creator/dashboard
/creator/analytics
/creator/posts
/creator/posts/new
/creator/posts/[postId]
```

Creators can:

- upload video through Cloudflare Stream when configured
- draft content
- submit posts for review
- edit posts
- duplicate posts
- archive posts
- delete owned posts
- review analytics where data is available

Creator dashboards work best when the signed-in account is linked to a `CreatorProfile`.

## Coach And Referee Experience

Coach and referee users can access:

```txt
/coach
/referee
```

These roles currently provide lighter community/workspace shells and can be expanded later.

## Sponsor Experience

Sponsors can access:

```txt
/sponsor/dashboard
/sponsor/applications
/sponsor/packages
/sponsor/placements
/sponsor/deliverables
/sponsor/billing
/sponsor/profile
```

Sponsors can apply through public sponsor flows and pay online through PayPal when enabled. Manual GCash/reference payment remains review-based.

## Partner Experience

Partners can access:

```txt
/partner
/partner/campaigns
/partner/referrals
/partner/agreements
/partner/profile
```

## Staff, Cashier, And Admin

Internal areas include:

```txt
/staff
/cashier
/admin
/admin/invoices
/admin/revenue
/admin/observability
/admin/sponsor-funnel
```

Admins can manage users, content, creators, feed moderation, sponsors, products, orders, invoices, revenue visibility, and settings depending on permission configuration.

## Community Feed

The feed is available on `/feed` and appears on the homepage.

Signed-in users may be able to:

- follow creators
- like posts
- save posts
- comment on posts
- share posts
- open merch linked from tags or placements

View counts and watch-time tracking are product analytics, not fraud-resistant measurement.

## Official Merch

The merch flow supports:

- `/shop` browsing
- product detail pages
- selected size/color variants
- `/cart`
- `/checkout`
- email-based `/account/orders` lookup

Checkout payment options may include COD, GCash manual, Maya manual, bank transfer, card manual, and cash depending on configuration.

## PayPal Payments And Invoices

The platform is PayPal-first for sponsor payments and invoice billing.

PayPal flows include:

- sponsor checkout
- server-side PayPal capture
- PayPal invoice creation
- PayPal invoice sending
- PayPal webhook sync
- admin invoice and revenue dashboards

Payment status should only be trusted after server-side capture, verified webhook processing, or reviewed manual payment action.

## Support

Use `/support` for:

- sponsorships
- orders
- payments
- events
- custom apparel
- partnerships

If OpenAI workflow credentials are unavailable, support should degrade to local routing/fallback behavior instead of crashing.

## If Something Looks Missing

Common reasons:

- account is not linked to the expected role record
- feature is available only to another role
- data exists in Preview but not Production
- environment variables are missing
- schema migration has not reached the target database
- payment or webhook flow requires admin review

Contact the admin/support team when access or payment state is unclear.

## Security Reminders

- Never paste secrets into chat, screenshots, tickets, or Markdown.
- Treat PayPal and database credentials as server-only.
- Use PayPal sandbox until the full flow is verified.
- Rotate any exposed secret immediately.
