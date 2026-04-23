# API

Updated: 2026-04-23
## Overview

Route handlers live under `src/app/api`. Middleware and the permission matrix in `src/lib/permissions.ts` protect sensitive routes, while public routes are intentionally readable without exposing admin data.

Accuracy notes:

- this repo mixes page-oriented and form-oriented handlers with route families that behave like APIs
- several creator and feed flows are intentionally incremental, so compatibility aliases still exist beside the primary handlers
- the current feed analytics layer is Phase 1 lightweight and should not be treated as anti-fraud-grade reporting

## Health And Readiness

- `GET /api/health`
- `GET /api/auth/me`

`/api/health` is the quickest way to verify:

- database connectivity
- support readiness
- additive schema drift on `ContentPost`
- additive schema drift on `MediaAsset`
- notification actor-column readiness on `PlatformNotification.actorUserId`

## Auth And Session Routes

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/google`
- `POST /api/auth/mobile/request-otp`
- `POST /api/auth/mobile/verify-otp`
- `POST /api/auth/mobile/login/request-otp`
- `POST /api/auth/mobile/login/verify-otp`

These routes support:

- standard password login
- Google sign-in and signup
- public mobile OTP signup
- public mobile OTP login
- role-aware redirect behavior after login

## Public Inquiry, Support, And Commerce Entry Points

- `POST /api/inquiries`
- `POST /api/sponsor-submissions`
- `GET /api/shop/products`
- `GET /api/shop/products/[slug]`
- `POST /api/checkout`
- `GET /api/chatkit/session`
- `POST /api/chatkit/session`
- `POST /api/chatkit/message`
- `POST /api/chatkit/lead`
- `GET /api/openai/webhook`
- `POST /api/openai/webhook`

Support behavior notes:

- `/api/chatkit/message` is the active support routing surface
- `/api/chatkit/lead` writes `Inquiry`, `PlatformNotification`, and `AutomatedEmail` records
- `/api/openai/webhook` verifies signed payloads when the webhook secret is configured

## Feed And Community Routes

Primary feed routes:

- `GET /api/feed`
- `POST /api/feed`
- `GET /api/feed/[postId]`
- `PATCH /api/feed/[postId]`
- `DELETE /api/feed/[postId]`
- `POST /api/feed/[postId]/like`
- `POST /api/feed/[postId]/save`
- `POST /api/feed/[postId]/share`
- `GET /api/feed/[postId]/stats`
- `POST /api/feed/[postId]/view`
- `POST /api/feed/[postId]/watchtime`
- `POST /api/feed/[postId]/products`

Comment routes:

- `GET /api/feed/[postId]/comments`
- `POST /api/feed/[postId]/comments`
- `PATCH /api/feed/[postId]/comments/[commentId]`
- `DELETE /api/feed/[postId]/comments/[commentId]`
- `POST /api/feed/[postId]/comments/[commentId]/reply`
- `POST /api/feed/[postId]/comments/[commentId]/moderate`

Creator follow routes:

- `POST /api/feed/creators/[creatorId]/follow`
- `POST /api/creators/[creatorId]/follow`

Promoted feed routes:

- `GET /api/feed/promoted`

Community behavior notes:

- public feed reads work without authentication
- follow, like, save, share, and comment mutations are session-aware
- `/api/creators/[creatorId]/follow` is a compatibility alias that re-exports the feed follow behavior
- view and watch-time registration use the current lightweight `ContentPost.viewCount` plus `metadataJson.analytics` bridge

## Creator Media And Post Studio Routes

- `POST /api/media/cloudflare/direct-upload`
- `POST /api/creator/posts/create`
- `POST /api/creator/posts/[postId]/publish`
- `POST /api/creator/posts/[postId]/unpublish`
- `POST /api/creator/posts/[postId]/archive`
- `POST /api/creator/posts/[postId]/duplicate`
- `DELETE /api/creator/posts/[postId]/delete`
- `PATCH /api/creator/posts/[postId]/update`

Creator workflow notes:

- direct video upload is designed for Vercel-safe Cloudflare Stream delivery
- creator action routes use the repoâ€™s real session and ownership checks, not bridge headers
- creator â€œpublishâ€ respects the moderation model, so creators usually move posts into `PENDING_REVIEW` while elevated roles can publish directly

## Notifications, Uploads, And Shared Protected Routes

- `GET /api/notifications`
- `PATCH /api/notifications/[id]`
- `GET /api/activity-logs`
- `POST /api/uploads/image`
- `GET /api/uploads/image/[id]`
- `GET /api/uploads/r2/[...key]`

Upload behavior notes:

- image uploads support database-backed and R2-backed delivery
- creator video uploads are handled through the Cloudflare Stream direct-upload route, not local disk

## Sponsor Routes

- `/api/sponsor/applications` and `/api/sponsor/applications/[id]`
- `/api/sponsor/deliverables` and `/api/sponsor/deliverables/[id]`
- `/api/sponsor/packages`
- `/api/sponsor/billing`
- `/api/sponsor/placements` and `/api/sponsor/placements/[id]`
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

Admin route families live under `/api/admin/*` and back the dashboard modules for:

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

This is an internal admin surface, not a public third-party API contract.
