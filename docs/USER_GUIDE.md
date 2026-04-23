# USER GUIDE

Updated: 2026-04-23
## What This Platform Is

RESURGENCE Powered by DesignXpress is a basketball-focused platform that combines:

- public brand and service pages
- creators and community content
- support and contact flows
- sponsorship and partnership inquiry paths
- Official Resurgence Merch commerce
- free public role registration
- protected role-based workspaces

## Public Visitors

Without signing in, you can:

- browse the homepage, services, sponsors, partnerships, and creator pages
- explore the public community feed on `/feed`
- browse Official Resurgence Merch on `/shop`
- add items to `/cart` and complete `/checkout`
- look up orders on `/account/orders` using the checkout email
- submit sponsor applications on `/sponsor/apply`
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
- `/creator/posts`
- `/creator/posts/new`
- `/creator/posts/[postId]`

What to expect:

- creator dashboards work best when the signed-in account is linked to a `CreatorProfile`
- creators can upload video through the Cloudflare-backed composer flow
- creators can draft, submit for review, edit, duplicate, archive, and delete their own posts
- creator self-publish still respects the moderation model

### Coach And Referee

Coach and referee accounts currently provide lighter dashboard shells at:

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
- checkout payment choices for COD, GCash, Maya, bank transfer, card, and cash
- email-based order lookup on `/account/orders`

Even if you are signed in as a member, merch order lookup is still keyed to the checkout email, not a separate customer-account order system.

## Support And Quotation Help

Use `/support` for guided help with:

- sponsorships
- orders
- payments
- events
- custom apparel
- partnerships

Use `/quotation` or the support/contact flows when you have serious business intent such as custom uniforms, large apparel orders, sponsorships, or partnership requests.

## If Something Looks Missing

This usually means one of these:

- your account is not linked to the right role or related record
- required data has not been created yet
- your role has a lightweight shell today and a deeper workflow is planned later
- the current environment is behind on additive Prisma migrations
- the relevant feature needs a human team member to confirm next steps

When in doubt, contact the admin or support team.

## Compatibility Notes

Some older URLs remain as compatibility redirects:

- `/partner/dashboard` redirects to `/partner`
- `/admin/revenue-monitoring` redirects to `/admin/reports`
- `/cashier/revenue-monitoring` redirects to `/cashier/reports`
- nested sponsor dashboard subpages redirect to the top-level sponsor routes
