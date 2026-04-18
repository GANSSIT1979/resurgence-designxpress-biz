# ADMIN GUIDE

Updated: 2026-04-19

## Admin Scope

System Admin users oversee:

- users and role assignments
- sponsors, sponsor packages, submissions, and sponsor inventory
- creators, media events, gallery media, and content
- inquiries and support lead follow-up
- shop products and shop orders
- settings and executive reports

## Core Admin Areas

- `/admin`
- `/admin/users`
- `/admin/inquiries`
- `/admin/content`
- `/admin/creator-network`
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

`/admin/revenue-monitoring` is now just a compatibility redirect to `/admin/reports`.

## Daily Admin Checklist

1. Review new inquiries and support leads
2. Review sponsor submissions and sponsor records
3. Check creator, gallery, and public content changes
4. Review reports, settings, and notifications
5. Review email automation failures if `EMAIL_WEBHOOK_URL` is configured

## Support Oversight

The support desk can create:

- `Inquiry` records
- `PlatformNotification` records
- `AutomatedEmail` records

Support lead follow-up usually starts from `/admin/inquiries`.

## API Notes

- many admin collection and item routes are dashboard form handlers and use `POST`
- admin-only data access is enforced by middleware and the permission matrix
