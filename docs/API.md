# API

Updated: 2026-04-19

## Overview

Route handlers live under `src/app/api`. Middleware protects `/api/*` using the role permission matrix in `src/lib/permissions.ts`.

Important behavior note:

- many admin module handlers use `POST` for create and update flows instead of strict REST-only verbs
- dashboard page redirects such as `/admin/revenue-monitoring` and `/cashier/revenue-monitoring` are page compatibility routes, not separate API modules

## Public Routes

- `GET /api/health`
- `POST /api/inquiries`
- `POST /api/sponsor-submissions`
- `GET /api/shop/products`
- `GET /api/shop/products/[slug]`
- `POST /api/checkout`

Commerce behavior note:

- the current cart is stored client-side and does not have a dedicated `/api/cart` route
- checkout accepts official merch variants through each item `variantLabel`
- supported checkout payment methods are `COD`, `GCASH_MANUAL`, `MAYA_MANUAL`, `BANK_TRANSFER`, `CARD_MANUAL`, and `CASH`
- `/account/orders` is a page-level email lookup flow, not an API resource

## Auth And Shared Protected Routes

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/notifications`
- `PATCH /api/notifications/[id]`
- `GET /api/activity-logs`
- `POST /api/uploads/image`

## Support Routes

- `GET /api/chatkit/session`
- `POST /api/chatkit/session`
- `POST /api/chatkit/message`
- `POST /api/chatkit/lead`
- `GET /api/openai/webhook`
- `POST /api/openai/webhook`

Current support behavior:

- `GET /api/chatkit/session` returns support bootstrap status for the widget
- `POST /api/chatkit/session` returns either a conversation bootstrap or a local ChatKit-style session payload
- `POST /api/chatkit/message` routes questions into `sponsorships`, `events`, `custom-apparel`, or `partnerships`
- `POST /api/chatkit/lead` creates an `Inquiry` and queues platform notifications and automated emails
- `POST /api/openai/webhook` verifies signed webhook payloads

## Sponsor Portal Routes

- `/api/sponsor/applications` and `/api/sponsor/applications/[id]`
- `/api/sponsor/deliverables` and `/api/sponsor/deliverables/[id]`
- `/api/sponsor/packages`
- `/api/sponsor/billing`
- `/api/sponsor/profile`

## Partner Routes

- `/api/partner/profile`
- `/api/partner/campaigns` and `/api/partner/campaigns/[id]`
- `/api/partner/referrals` and `/api/partner/referrals/[id]`
- `/api/partner/agreements` and `/api/partner/agreements/[id]`

## Staff Routes

- `/api/staff/tasks` and `/api/staff/tasks/[id]`
- `/api/staff/schedule` and `/api/staff/schedule/[id]`
- `/api/staff/announcements` and `/api/staff/announcements/[id]`
- `/api/staff/inquiries` and `/api/staff/inquiries/[id]`

## Cashier Routes

- `/api/cashier/invoices` and `/api/cashier/invoices/[id]`
- `/api/cashier/transactions` and `/api/cashier/transactions/[id]`
- `/api/cashier/receipts` and `/api/cashier/receipts/[id]`
- `/api/cashier/reports/summary`
- `/api/cashier/reports/export`

## Admin Routes

Admin module routes exist for:

- content
- creator network
- gallery media
- inquiries
- media events
- partners
- product services
- reports
- settings
- merch orders
- official merch products
- sponsor inventory
- sponsor packages
- sponsor submissions
- sponsors
- users

Some admin modules expose collection and item endpoints that are thin form-backed CRUD handlers rather than a fully uniform REST surface.

Official merch admin endpoints specifically include:

- `GET /api/admin/shop-products`
- `POST /api/admin/shop-products`
- `PUT /api/admin/shop-products/[id]`
- `DELETE /api/admin/shop-products/[id]`
- `GET /api/admin/shop-orders`
- `PUT /api/admin/shop-orders/[id]`
