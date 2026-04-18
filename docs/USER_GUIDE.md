# USER GUIDE

Updated: 2026-04-19

## What This Platform Is

RESURGENCE Powered by DesignXpress is a sponsorship and business operations platform with:

- public information pages
- sponsor applications
- support and contact channels
- creator and gallery presentation
- sponsor-facing portal access
- creator-facing dashboard access when a creator account is linked
- internal dashboards for admin, cashier, staff, and partner users

Important accuracy note:

- creator dashboard access depends on a `CREATOR` role account and a matching creator profile record

## Public Visitors

You can:

- browse sponsorship information and public site content
- submit a sponsor application on `/sponsor/apply`
- send a general inquiry through the public contact flow
- use the support area on `/support`
- browse sponsor and creator content
- browse Official Resurgence Merch on `/shop`, manage `/cart`, complete `/checkout`, and look up orders on `/account/orders`
- select merch size/color variants on product pages when options are available

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

## Creator Users

Creator content is public, and creator users can access creator dashboard features when their account is configured.

What you should expect:

- public creator profiles appear in the creators directory
- creator dashboard access requires a `CREATOR` role login
- creator dashboard features work best when the signed-in email is linked to a `CreatorProfile`
- creator records are managed through the platform's admin tools

## Official Merch

The merch flow supports:

- searchable product browsing on `/shop`
- product details with stock, material, fit, care, size, and color options
- cart lines that preserve selected variants
- checkout payment choices for Cash on Delivery, GCash, Maya, Bank Transfer, Credit/Debit Card, and Cash
- email-based order lookup on `/account/orders`

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
