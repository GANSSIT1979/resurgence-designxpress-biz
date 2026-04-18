# ARCHITECTURE

## High-Level Overview

The system is organized into four layers:

1. Public Experience
2. Role-Based Dashboard Experience
3. API and Business Logic
4. Persistence and External Services

## Public Layer

Main public pages:

- Home
- About
- Services
- Sponsors
- Sponsor Apply
- Contact
- Support

Public workflows:

- inquiry submission
- sponsor application submission
- creator profile browsing
- gallery browsing
- AI support entry point

## Dashboard Layer

Protected dashboard areas:

- `/admin`
- `/cashier`
- `/sponsor/dashboard`
- `/staff`
- `/partner`

Each dashboard uses a shared navigation shell and should progressively use common orchestration, form, and semantics components.

## Business Modules

### Admin
- sponsor applications
- sponsors
- inquiries
- creator network
- gallery
- content and settings
- user and role management
- reports

### Cashier
- invoices
- transactions
- receipts
- reporting

### Sponsor
- overview
- applications
- deliverables
- billing
- profile

## Authentication Model

- JWT signed session token
- HTTP-only cookie
- role-based routing and access rules
- sponsor and partner linkage through foreign keys on `User`

## Data Flow

Typical request flow:

1. user opens page
2. page calls server-side Prisma query or API route
3. auth helper validates session when protected
4. Prisma reads or writes records
5. page renders UI or API returns JSON

## Optional AI Layer

The support workflow can integrate with an AI support agent. This layer should be optional and should not block the rest of the application from building.

Recommended behavior:

- if AI dependencies are missing, support page still loads
- if API key is missing, return a controlled disabled-state response
- store chat session state in `ChatConversation` and `ChatMessage`

## Current Shared UI Strategy

Current premium system layers:

- dashboard shell
- page orchestrator
- CRUD manager
- chart card
- data table
- premium form layer
- status and semantics layer

These should be used consistently instead of custom page-by-page UI fragments.

## Deployment Modes

### Local Development
- SQLite
- Prisma schema push
- seeded demo data

### Production
- PostgreSQL
- hosted app on Vercel, Railway, Render, Docker, or similar
- environment variables managed by deployment provider

## Recommended Folder Philosophy

- `src/app` for pages and routes
- `src/components` for reusable UI
- `src/lib` for auth, db, helpers, and integrations
- `prisma` for schema and seed logic
- `public/uploads` for local uploaded media
