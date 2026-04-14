# Module Page Schema-Aligned Patch

This pack corrects the module page conversion layer to match your actual Prisma schema.

Main fixes:
- `SponsorApplication` used instead of the non-existent `SponsorSubmission`
- sponsor application field names corrected:
  - `sponsorName`
  - `company`
  - `packageInterest`
- inquiry statuses corrected to:
  - `NEW`
  - `REVIEWED`
  - `CLOSED`
- invoice fields corrected:
  - `number`
  - `balanceDue`
- receipt field corrected:
  - `number`
- sponsor billing page now reads linked sponsor invoices if present
- admin overview page corrected to use `db.sponsorApplication`

Replace:
- `src/app/admin/page.tsx`
- `src/app/sponsor/dashboard/applications/page.tsx`
- `src/app/sponsor/dashboard/billing/page.tsx`
- `src/app/sponsor/dashboard/deliverables/page.tsx`
- `src/app/admin/sponsor-submissions/page.tsx`
- `src/app/admin/gallery/page.tsx`
- `src/app/admin/inquiries/page.tsx`
- `src/app/cashier/invoices/page.tsx`
- `src/app/cashier/receipts/page.tsx`
- `src/app/cashier/reports/page.tsx`

Then run:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run prisma:generate
npm run dev
```
