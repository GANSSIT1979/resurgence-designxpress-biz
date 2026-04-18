# API

Updated: 2026-04-16

## Overview

The active application mixes server-rendered Prisma pages with route handlers under `src/app/api`. The list below focuses on the active route groups in the main `src/` application.

## Auth

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

## Public Intake

- `POST /api/inquiries`
- `POST /api/sponsor-applications`
- `GET /api/health`
- `POST /api/upload`

## AI Customer Service

- `GET /api/chatkit/session`
- `POST /api/chatkit/session`
- `POST /api/chatkit/message`
- `POST /api/chatkit/lead`
- `GET /api/openai/webhook`
- `POST /api/openai/webhook`

### Support Behavior

- `/api/chatkit/session` returns readiness metadata on `GET`
- `/api/chatkit/session` creates either a conversation bootstrap or an OpenAI ChatKit session on `POST`
- `/api/chatkit/message` classifies requests into sponsorships, events, custom apparel, or partnerships
- `/api/openai/webhook` verifies OpenAI webhook signatures before accepting events

## Sponsor Routes

- `GET /api/sponsor/applications`
- `GET /api/sponsor/billing`
- `GET /api/sponsor/deliverables`
- `GET /api/sponsor/packages`
- `GET /api/sponsor/profile`
- `POST /api/sponsor/profile`

## Cashier Routes

- `GET /api/cashier/reports/summary`
- `GET /api/cashier/invoices`
- `POST /api/cashier/invoices`
- `GET /api/cashier/transactions`
- `POST /api/cashier/transactions`
- `GET /api/cashier/receipts`
- `POST /api/cashier/receipts`
- revenue monitoring routes for admin and cashier are also present

## Admin Routes

The admin surface includes route groups for:

- content
- creator network
- gallery and gallery media
- inquiries
- media events
- partners
- products and services
- reports
- revenue monitoring
- settings
- sponsor inventory
- sponsor packages
- sponsor submissions
- sponsors
- users
- activity logs
- saved views
- bulk actions

## Current Caveats

- Some admin and sponsor routes still reference older delegate or field names and are part of the current stabilization backlog.
- As of 2026-04-16, `npm run build` stops first on `src/app/api/sponsor/profile/route.ts` because `@/lib/sponsor-server` is missing.
- Use the active Prisma schema as the source of truth when route assumptions and docs conflict.
