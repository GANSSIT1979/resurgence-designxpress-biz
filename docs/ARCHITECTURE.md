# ARCHITECTURE

Updated: 2026-04-16

## High-Level Layers

1. Public experience
2. Role-based dashboards
3. API and business logic
4. Prisma persistence
5. External integrations

## Public Experience

Main public routes include:

- `/`
- `/about`
- `/services`
- `/sponsors`
- `/sponsor/apply`
- `/contact`
- `/support`
- `/creator/[slug]`

## Dashboard Experience

Primary dashboard entry points:

- `/admin`
- `/cashier`
- `/sponsor/dashboard`
- `/staff`
- `/partner`
- `/creator/dashboard`

## Server Layer

The application uses Next.js App Router route handlers for:

- auth
- form submissions
- support session and message flows
- admin CRUD surfaces
- sponsor portal data
- cashier finance operations

## Persistence Layer

The application persists business data through Prisma and the prepared schema flow:

- `prisma/schema.template.prisma`
- `scripts/prepare-prisma.mjs`
- `prisma/schema.prisma`

## AI Support Flow

Current support path:

1. Visitor opens `/support`
2. Frontend requests readiness and conversation state from `/api/chatkit/session`
3. Messages are posted to `/api/chatkit/message`
4. Business details are saved through `/api/chatkit/lead`
5. Production ChatKit sessions can be created through `/api/chatkit/session`
6. OpenAI background events return to `/api/openai/webhook`

## External Services

- OpenAI for workflow-backed support
- PostgreSQL for production deployment
- local filesystem uploads during local development

## Current Architectural Debt

- a few routes still reference older helpers or schema shapes
- some historical notes describe earlier patch packs rather than the current repository state
- the active application is in `src/`, while archived or nested subprojects still exist alongside it
