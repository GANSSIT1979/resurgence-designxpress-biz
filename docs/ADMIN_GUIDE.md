# ADMIN GUIDE

Updated: 2026-04-16

## Admin Scope

System Admin users oversee:

- sponsor applications and sponsor records
- creator profiles
- gallery and media events
- inquiries and support lead follow-up
- users and roles
- settings and reports
- revenue monitoring and finance visibility

## Core Admin Areas

- `/admin`
- `/admin/users`
- `/admin/inquiries`
- `/admin/gallery`
- `/admin/creator-network`
- `/admin/settings`
- `/admin/reports`

## Daily Admin Checklist

1. Review new inquiries and support leads
2. Review sponsor applications
3. Check settings and contact values
4. Review report snapshots and finance summaries
5. Review any OpenAI support webhook failures if production AI support is enabled

## Support Oversight

The support desk can create:

- conversation history in Prisma
- lead capture records
- inquiry records
- email queue records
- admin notifications

## Current Caveat

Some admin modules still sit inside the broader stabilization backlog because of older schema assumptions. Use the active Prisma schema and route handlers as the authority while those pages are being repaired.
