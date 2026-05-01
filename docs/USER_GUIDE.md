# USER GUIDE

Updated: 2026-05-01

## What This Platform Is

RESURGENCE Powered by DesignXpress is a basketball-focused creator, commerce, sponsorship, and billing platform that combines:

- public brand and service pages
- creators and community content
- support and contact flows
- sponsorship and partnership inquiry paths
- DAYO Series and event sponsorship packages
- Official Resurgence Merch commerce
- PayPal-first sponsor payments and invoice billing
- free public role registration
- protected role-based workspaces
- admin dashboards for invoices, sponsor activity, and revenue visibility

## Public Visitors

Without signing in, you can:

- browse the homepage, services, sponsors, partnerships, and creator pages
- explore the public community feed on `/feed`
- browse Official Resurgence Merch on `/shop`
- add items to `/cart` and complete `/checkout`
- look up orders on `/account/orders` using the checkout email
- submit sponsor applications on `/sponsor/apply`
- review DAYO Series OFW All-Star sponsorship packages on `/dayo-series-ofw-all-star`
- apply for DAYO sponsorship through `/dayo-series-ofw-all-star/apply`
- reach out through `/contact`, `/support`, or `/quotation`

## Create A Free Account

Open `/login` to:

- sign in with an existing account
- create a new free account with Google
- create a new free account with mobile OTP verification

Public signup roles are:

- Regular Member
- Creator
- Coach
- Referee
- Sponsor
- Partner

After signup or login, the platform redirects you to the dashboard that matches your role.

## Role Experiences

### Regular Member

Members use `/member` as their community home base.

The member dashboard can show:

- merch order summary and quick lookup links
- followed creators
- saved feed posts
- notifications and workflow inbox items
- uploaded content tied to the account
- community highlights
- featured merch recommendations

### Creator

Creator users can access:

- `/creator/dashboard`
- `/creator/analytics`
- `/creator/posts`
- `/creator/posts/new`
- `/creator/posts/[postId]`

What to expect:

- creator dashboards work best when the signed-in account is linked to a `CreatorProfile`
- creator analytics shows live rollup data when the analytics migration is active and clearly labels preview/demo fallback when it is not
- creators can upload video through the Cloudflare-backed composer flow
- creators can draft, submit for review, edit, duplicate, archive, and delete their own posts
- creator self-publish still respects the moderation model

### Coach And Referee

Coach and referee accounts provide lighter dashboard shells at:

- `/coach`
- `/referee`

These roles are positioned for profile completion, future coordination, and community access rather than deep workflow management today.

### Sponsor

Sponsor users can access:

- `/sponsor/dashboard`
- `/sponsor/applications`
- `/sponsor/packages`
- `/sponsor/placements`
- `/sponsor/deliverables`
- `/sponsor/billing`
- `/sponsor/profile`

Sponsors can also use the DAYO sponsorship funnel:

- open `/dayo-series-ofw-all-star`
- select a package
- submit the sponsor application form
- pay online with PayPal when enabled
- submit a GCash reference for manual verification when using manual payment

Current DAYO sponsorship packages include:

- Supporting Sponsor: PHP 15,000-50,000
- Official Brand Partner: PHP 75,000-95,000
- Major Partner: PHP 120,000-150,000
- Event Presenting: custom proposal

### Partner

Partner users can access:

- `/partner`
- `/partner/campaigns`
- `/partner/referrals`
- `/partner/agreements`
- `/partner/profile`

### Staff, Cashier, And Admin

These internal roles are provisioned by the platform team and are not part of the public self-signup flow.

Internal role areas include:

- `/staff`
- `/cashier`
- `/admin`

Admin billing and revenue areas include:

- `/admin/invoices` for invoice listing, invoice totals, customer visibility, paid revenue, and outstanding balances
- `/admin/revenue` for PayPal revenue analytics, invoice conversion, sponsor conversion, unpaid invoice alerts, and recent paid invoice visibility

## Community Feed

The feed is available on `/feed` and also appears on the homepage.

What signed-in users can do depends on role and permissions, but the platform supports:

- reading public creator and community posts
- following creators
- liking posts
- saving posts
- commenting on posts
- sharing posts and opening deep links
- opening merch linked from product tags or sponsor placements

Important note:

- view counts and watch-time tracking are active, but the current analytics layer is lightweight and intended for product feedback rather than fraud-resistant reporting

## Official Merch

The merch flow supports:

- product browsing on `/shop`
- product detail pages with stock, material, fit, care, size, and color options
- cart lines that preserve selected variants
- checkout payment choices for COD, GCash, Maya, bank transfer, PayPal, card where enabled, and cash
- email-based order lookup on `/account/orders`

Even if you are signed in as a member, merch order lookup is still keyed to the checkout email, not a separate customer-account order system.

## PayPal Payments And Invoices

The platform is PayPal-first for online sponsor payments and invoice billing.

Main PayPal-supported flows:

- sponsor checkout creates a PayPal order and redirects the sponsor to PayPal
- PayPal return flow captures approved sponsor payments through `/payment/success`
- saved invoices can be sent through PayPal invoicing
- PayPal webhook events update local invoice payment status when payment is completed
- admin revenue dashboards use local invoice and sponsor data to show paid revenue, outstanding balances, and conversion metrics

Useful billing paths:

- `/admin/invoices`
- `/admin/revenue`
- `/payment/success`
- `/payment/cancel`

Payment status behavior:

- sponsor PayPal payment capture can approve a sponsor submission
- GCash payment references are manual and usually require review
- PayPal invoice payment webhooks can mark local invoices as `PAID`
- invoices may appear as `DRAFT`, `SENT`, `PAID`, or another operational status depending on workflow state

## Support And Quotation Help

Use `/support` for guided help with:

- sponsorships
- orders
- payments
- PayPal invoices
- events
- custom apparel
- partnerships

Use `/quotation` or the support/contact flows when you have serious business intent such as custom uniforms, large apparel orders, sponsorships, invoice requests, or partnership requests.

## If Something Looks Missing

This usually means one of these:

- your account is not linked to the right role or related record
- required data has not been created yet
- your role has a lightweight shell today and a deeper workflow is planned later
- the current environment is behind on additive Prisma migrations
- PayPal or webhook environment variables are not configured for the current deployment
- invoice or sponsor records exist in another environment such as Preview instead of Production
- the relevant feature needs a human team member to confirm next steps

When in doubt, contact the admin or support team.

## Compatibility Notes

Some older URLs remain as compatibility redirects:

- `/partner/dashboard` redirects to `/partner`
- `/admin/revenue-monitoring` redirects to `/admin/reports`
- `/cashier/revenue-monitoring` redirects to `/cashier/reports`
- nested sponsor dashboard subpages redirect to the top-level sponsor routes

## Operational Notes For Admins

- Treat PayPal as the primary online billing provider unless a multi-provider strategy is deliberately reintroduced.
- Keep GCash as manual/reference-based unless automated verification is added later.
- Do not paste real secrets into tickets, markdown, screenshots, or chat logs.
- After payment, Prisma, or environment-variable updates, redeploy on Vercel with Build Cache OFF.
- Use the PayPal sandbox until sponsor checkout, invoice send, invoice payment, webhook sync, and dashboards are verified end to end.
