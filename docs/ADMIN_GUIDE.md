# ADMIN GUIDE

Updated: 2026-04-23
## Admin Scope

System Admin users oversee:

- users and role assignments
- sponsors, sponsor packages, submissions, placements, and sponsor inventory
- creators, creator profiles, creator posts, media events, gallery media, and feed moderation
- inquiries, support leads, notifications, and workflow visibility
- Official Resurgence Merch products and merch orders
- settings, reports, and operational visibility

## Core Admin Areas

- `/admin`
- `/admin/users`
- `/admin/inquiries`
- `/admin/content`
- `/admin/creator-network`
- `/admin/creators`
- `/admin/feed`
- `/admin/gallery`
- `/admin/partners`
- `/admin/product-services`
- `/admin/products`
- `/admin/orders`
- `/admin/settings`
- `/admin/reports`
- `/admin/sponsor-inventory`
- `/admin/sponsor-packages`
- `/admin/sponsor-submissions`
- `/admin/sponsors`

`/admin/revenue-monitoring` is a compatibility redirect to `/admin/reports`.

## Daily Admin Checklist

1. Review new inquiries, support leads, and unread notifications
2. Review sponsor submissions, placements, deliverables, and sponsor records
3. Review creator profile changes, creator posts, gallery media, and feed moderation queues
4. Review merch products, stock, featured drops, and open merch orders
5. Review user records, role assignments, and linked sponsor, partner, or creator profiles
6. Review reports, settings, and automation failures when webhook delivery is enabled

## User And Role Administration

Use `/admin/users` to:

- activate or deactivate users
- assign roles
- validate whether a role-linked record exists
- troubleshoot why a dashboard or protected page is not loading as expected

Important examples:

- creator dashboards depend on a `CREATOR` login plus a linked `CreatorProfile`
- sponsor and partner dashboards depend on linked profile records
- member accounts can self-register, but merch order history still depends on checkout email

## Content And Community Operations

Admin content responsibilities span:

- creator directory records
- feed moderation and post visibility
- promoted sponsor placement oversight
- media events and gallery uploads
- public content sections and settings-driven copy
- creator post review and publish decisions

Use `/admin/feed` when you need to moderate creator-commerce content, review promoted placements, or validate how public posts are surfaced.

## Official Merch Admin

Use `/admin/products` to create and update official merch products with:

- product images
- prices and compare-at prices
- stock levels
- size and color options
- material, fit, and care details
- featured and published flags

Use `/admin/orders` to review merch orders, selected variants, shipping details, payment method, payment status, and fulfillment status.

## Support And Workflow Oversight

The support and automation layer can create:

- `Inquiry` records
- `PlatformNotification` records
- `AutomatedEmail` records

Use `/api/health` when you need a fast probe for support readiness and schema drift before assuming a dashboard query problem is user-specific.

## API Notes

- admin collection and item routes live under `/api/admin/*`
- many admin handlers are form-oriented `POST`, `PUT`, `PATCH`, or `DELETE` flows rather than a public REST contract
- admin-only data access is enforced by middleware and the permission matrix
