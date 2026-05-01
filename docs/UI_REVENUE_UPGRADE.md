# UI + Revenue Optimization Upgrade

Updated: 2026-05-02

## Included

- Sponsor CRM Kanban: `/admin/sponsor-crm`
- Sponsor list API: `/api/sponsor/list`
- Sponsor stage update API: `/api/sponsor/update-stage`
- AI follow-up API: `/api/ai/followup`
- Revenue forecasting helper: `src/lib/revenue/forecast.ts`
- Optional Prisma model: `SponsorLead`

## Setup

1. Copy files into the repo.
2. Add `prisma/sponsor-crm-model.prisma` model into `prisma/schema.prisma` if you want a dedicated CRM table.
3. Run:

```bash
npm run prisma:generate
npm run db:push
npm run prisma:generate
npm run vercel-build
```

## Notes

If `SponsorLead` is not added yet, the CRM UI falls back to `SponsorSubmission` records.
Stage updates can trigger AI follow-ups through `sendAutomatedFollowUp()`.
