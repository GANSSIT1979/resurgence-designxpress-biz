# USER GUIDE

Updated: 2026-04-19

## What This Platform Is

RESURGENCE Powered by DesignXpress is a sponsorship and business operations platform with:

- public information pages
- sponsor applications
- support and contact channels
- creator and gallery presentation
- sponsor-facing portal access
- internal dashboards for admin, cashier, staff, and partner users

Important accuracy note:

- the current app does not include a dedicated creator-facing login or creator dashboard

## Public Visitors

You can:

- browse sponsorship information and public site content
- submit a sponsor application on `/sponsor/apply`
- send a general inquiry through the public contact flow
- use the support area on `/support`
- browse sponsor and creator content
- browse `/shop`, manage `/cart`, complete `/checkout`, and look up orders on `/account/orders`

## Sponsor Users

Sponsor users can typically access:

- sponsor overview
- applications
- deliverables
- billing reference
- profile updates

What you should expect:

- only sponsor-linked data should be visible to your account
- profile details should save through the sponsor profile page
- deliverables and application history should reflect current sponsor records

## Creator Profiles

Creator content is public in the current app.

What you should expect:

- creator profiles appear as public presentation pages, not signed-in user dashboards
- there is no `CREATOR` login role or creator dashboard flow in this repository
- creator records are managed through the platform's admin tools

## Support

The Support page may operate in one of two modes:

- live AI enabled
- graceful disabled mode with guidance to use contact channels

When support captures enough lead detail, the platform can create inquiry and follow-up records for the internal team.

## Login

Use the credentials provided by the platform administrator or the seeded local demo credentials in development.

Current signed-in role areas are:

- admin
- cashier
- sponsor
- staff
- partner

## If Something Looks Missing

This usually means one of these:

- your account is not linked to the correct role or related record
- data has not been created yet
- a module is partially configured but not populated

When in doubt, contact the admin team.

## Compatibility Notes

Some older URLs remain as compatibility redirects:

- `/partner/dashboard` redirects to `/partner`
- `/admin/revenue-monitoring` redirects to `/admin/reports`
- `/cashier/revenue-monitoring` redirects to `/cashier/reports`
- nested sponsor dashboard subpages redirect to the top-level sponsor routes
