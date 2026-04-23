# API

Updated: 2026-04-23

## Overview

Route handlers live under `src/app/api`. Middleware protects `/api/*` with the role permission matrix in `src/lib/permissions.ts`.

Accuracy notes:

- many admin and dashboard-backed modules use pragmatic form-oriented handlers rather than a strict REST-only style
- some page compatibility redirects exist in the UI layer and should not be treated as separate API modules

## Public Health, Inquiry, And Commerce Entry Points

- `GET /api/health`
- `POST /api/inquiries`
- `POST /api/sponsor-submissions`
- `GET /api/shop/products`
- `GET /api/shop/products/[slug]`
- `POST /api/checkout`

Commerce behavior notes:

- the cart is client-side and there is no active collection-level `/api/cart` route
- checkout accepts merch variants through each item `variantLabel`
- supported payment methods are `COD`, `GCASH_MANUAL`, `MAYA_MANUAL`, `BANK_TRANSFER`, `CARD_MANUAL`, and `CASH`
- `/account/orders` is a page-level email lookup flow, not an order API resource

## Auth And Session Routes

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/google`
- `POST /api/auth/mobile/request-otp`
- `POST /api/auth/mobile/verify-otp`

These routes power both standard sign-in and free public account creation from `/login`.

## Feed And Community Routes

- `GET /api/feed`
- `POST /api/feed`
- `GET /api/feed/[postId]`
- `PATCH /api/feed/[postId]`
- `DELETE /api/feed/[postId]`
- `GET /api/feed/[postId]/comments`
- `POST /api/feed/[postId]/comments`
- `POST /api/feed/[postId]/like`
- `POST /api/feed/[postId]/save`
- `POST /api/feed/[postId]/products`
- `POST /api/feed/creators/[creatorId]/follow`
- `POST /api/creators/[creatorId]/follow`
- `GET /api/feed/promoted`

Community behavior notes:

- public reads work without authentication
- create/update/delete flows are limited to allowed feed actors such as creator, staff, or admin users
- follow, like, comment, and save actions require an authenticated actor
- `/api/creators/[creatorId]/follow` is a compatibility alias that re-exports the feed follow handler

## Notifications, Uploads, And Shared Protected Routes

- `GET /api/notifications`
- `PATCH /api/notifications/[id]`
- `GET /api/activity-logs`
- `POST /api/uploads/image`
- `GET /api/uploads/image/[id]`
- `GET /api/uploads/r2/[...key]`

`GET /api/notifications` returns the role/user inbox view backed by `PlatformNotification` and `AutomatedEmail` records.

## Support Routes

- `GET /api/chatkit/session`
- `POST /api/chatkit/session`
- `POST /api/chatkit/message`
- `POST /api/chatkit/lead`
- `GET /api/openai/webhook`
- `POST /api/openai/webhook`

Current support routing categories:

- sponsorships
- orders
- payments
- events
- custom-apparel
- partnerships

Support behavior notes:

- `GET /api/chatkit/session` returns support bootstrap status for the widget
- `POST /api/chatkit/session` returns either a conversation bootstrap or a local ChatKit-style session payload
- `POST /api/chatkit/message` routes support questions into the configured category lanes above
- `POST /api/chatkit/lead` creates `Inquiry`, notification, and automated email records
- `POST /api/openai/webhook` verifies signed webhook payloads

## Sponsor Portal Routes

- `/api/sponsor/applications` and `/api/sponsor/applications/[id]`
- `/api/sponsor/deliverables` and `/api/sponsor/deliverables/[id]`
- `/api/sponsor/packages`
- `/api/sponsor/billing`
- `/api/sponsor/placements` and `/api/sponsor/placements/[id]`
- `/api/sponsor/profile`

These routes back the sponsor dashboard, applications, deliverables, billing, placements, and profile pages.

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
- creators
- feed moderation
- gallery media and media events
- inquiries
- partners
- product services
- reports
- settings
- merch orders
- merch products
- sponsor inventory
- sponsor packages
- sponsor submissions
- sponsors
- users

Admin route families live under `/api/admin/*` and are intentionally aligned with the admin dashboard modules rather than exposed as a public third-party API surface.
