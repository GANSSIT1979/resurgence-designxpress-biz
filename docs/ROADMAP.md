# ROADMAP

Updated: 2026-04-16

## Current Phase

### Build Stabilization After AI Support Completion

The AI customer service routes are now wired, but the next active engineering phase is repository-wide stabilization so the entire application can typecheck and build cleanly.

## Recently Completed

- support route classification for sponsorships, events, custom apparel, and partnerships
- OpenAI ChatKit session creation path in `/api/chatkit/session`
- signed OpenAI webhook verification in `/api/openai/webhook`
- support production verification command through `npm run support:verify`
- documentation refresh across the active Markdown set

## Immediate Priorities

### 1. Resolve Known Build Blockers

- restore or replace `@/lib/sponsor-server`
- align sponsor profile routes with the active Prisma schema
- finish schema cleanup for content, gallery, cashier, and creator modules
- remove remaining legacy field references from old route conversions

### 2. Finish AI Customer Service Rollout

- publish the OpenAI Agent Builder workflow
- save the workflow ID to `OPENAI_WORKFLOW_ID`
- create the OpenAI project webhook
- save the signing secret to `OPENAI_WEBHOOK_SECRET`
- run `npm run support:verify -- --base-url=https://your-domain --webhook-secret=whsec_...` after deploy

### 3. Production Hardening

- add password reset and email verification
- add rate limiting and lockout rules
- add stronger audit log coverage where schema support is incomplete
- move uploads to object storage for real production use

## Next Phases

### Finance and Reporting

- richer cashier analytics
- PDF-ready document outputs
- saved report workflows and scheduled exports

### Workflow Operations

- notification delivery monitoring
- email automation provider integration
- SLA and escalation tracking for inquiries and support leads

### Media and CMS

- object storage, image optimization, and thumbnail generation
- improved gallery event and media management
- stronger sponsor and creator asset workflows

## Product Direction

The platform direction remains the same:

- public visitors discover, inquire, and enter support flows
- sponsors apply and manage branded commitments
- admins operate content, finance, and support routing
- cashiers reconcile invoices, transactions, and receipts
- AI support becomes a production-ready intake and triage layer once workflow publishing is complete
