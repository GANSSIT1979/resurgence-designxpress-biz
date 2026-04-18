# API

## API Design Notes

This project mixes:

- server-rendered Prisma usage directly in pages
- API routes for forms, auth, uploads, and module CRUD

## Core Route Groups

### Auth
- `POST /api/auth/login`
- `POST /api/auth/logout`

### Public Forms
- inquiry submission route
- sponsor application submission route

### Support / AI
- `POST /api/chatkit/session`
- `POST /api/chatkit/message`
- `POST /api/chatkit/lead`
- optional `POST /api/openai/webhook`

### Cashier
- invoice CRUD routes
- receipt CRUD routes
- transaction CRUD routes
- `GET /api/cashier/reports/summary`

### Sponsor
- sponsor profile route
- sponsor deliverables route
- sponsor application route

### Admin
- admin-facing CRUD routes for gallery, inquiries, sponsor applications, and related modules

## Response Conventions

Recommended JSON response shape:

```json
{
  "ok": true,
  "item": {},
  "items": []
}
```

Error shape:

```json
{
  "ok": false,
  "error": "Readable error message"
}
```

## Authentication Rules

Protected routes should:

- validate the session cookie
- resolve the current user
- enforce role access
- scope sponsor users to their own records

## Schema-Aligned Names

Important current API/data alignment:

- use `SponsorApplication`
- not `SponsorSubmission`
- use invoice `number`
- use invoice `balanceDue`
- use receipt `number`

## Suggested CRUD Coverage

### Inquiry
- list
- get one
- update status
- delete

### SponsorApplication
- list
- get one
- create
- update status
- delete

### GalleryMedia
- list
- create
- update
- delete

### Invoice
- list
- create
- update
- delete

### Receipt
- list
- create
- update
- delete

### CashierTransaction
- list
- create
- update
- delete

## API Stability Guidance

When refactoring UI layers, keep API paths stable and let page components adapt to the route outputs. This reduces regression risk.
