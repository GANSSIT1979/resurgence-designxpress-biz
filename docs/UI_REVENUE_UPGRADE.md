# UI And Revenue Optimization Upgrade

Updated: 2026-05-05

## Purpose

This document describes the sponsor CRM, revenue forecasting, and AI follow-up upgrade path for RESURGENCE Powered by DesignXpress.

## Current Alignment

The active platform already includes:

- sponsor application paths
- PayPal sponsor checkout
- PayPal invoice creation and sending
- PayPal webhook sync
- admin invoice dashboard
- admin revenue dashboard
- sponsor funnel dashboard
- observability metrics and alerts

Any revenue UI upgrade must preserve the PayPal-first billing architecture and avoid adding Stripe assumptions unless a deliberate multi-provider strategy is approved.

## Proposed Additions

Potential routes:

```txt
/admin/sponsor-crm
/api/sponsor/list
/api/sponsor/update-stage
/api/ai/followup
```

Potential helper:

```txt
src/lib/revenue/forecast.ts
```

Optional model:

```txt
SponsorLead
```

## Fallback Strategy

If `SponsorLead` is not added yet, CRM views should fall back to existing `SponsorSubmission`, `Sponsor`, invoice, and funnel data.

## Suggested Sponsor CRM Stages

```txt
NEW
QUALIFIED
PROPOSAL_SENT
CHECKOUT_STARTED
INVOICE_SENT
PAYMENT_COMPLETED
APPROVED
ACTIVATED
LOST
```

## AI Follow-Up Rules

AI follow-up generation should:

- use `OPENAI_API_KEY` only server-side
- fall back to template copy when OpenAI is unavailable
- log intended actions when delivery webhook URLs are missing
- avoid sending payment promises or unverified claims
- include audit metadata for admin review

## Revenue Forecasting Rules

Revenue forecasts should use:

- paid invoice totals
- outstanding invoice totals
- sponsor submissions by stage
- package amount ranges
- PayPal capture status
- manual payment review state

Do not trust client-side payment return pages as final revenue. Payment state should come from server-side capture, verified PayPal webhook processing, or reviewed manual payment actions.

## Setup

After adding code and schema changes:

```bash
npm run prisma:generate
npm run db:push
npm run prisma:generate
npm run build
```

For a migration-first rollout, generate and review migration SQL, apply to Preview first, then promote to Production.

## Verification

```bash
npm run type-check
npm run lint
npm run build
npx prisma migrate status
```

Manual checks:

- `/admin/revenue` still loads.
- `/admin/invoices` still loads.
- `/admin/sponsor-funnel` still loads.
- PayPal sponsor checkout still works in sandbox.
- PayPal invoice webhook still updates local state.
