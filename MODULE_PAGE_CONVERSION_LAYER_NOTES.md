# Module Page Conversion Layer Pack

Included:
- `src/app/sponsor/dashboard/applications/page.tsx`
- `src/app/sponsor/dashboard/billing/page.tsx`
- `src/app/sponsor/dashboard/deliverables/page.tsx`
- `src/app/admin/sponsor-submissions/page.tsx`
- `src/app/admin/gallery/page.tsx`
- `src/app/admin/inquiries/page.tsx`
- `src/app/cashier/invoices/page.tsx`
- `src/app/cashier/receipts/page.tsx`
- `src/app/cashier/reports/page.tsx`

What this conversion does:
- makes the requested module subpages use the new orchestration pattern
- keeps sponsor pages partner-facing and readable
- keeps admin and cashier pages aligned to the premium CRUD/table workflow
- reuses the newer status badge, empty state, chart, data table, and orchestration layer

Before applying:
- make sure these shared components already exist:
  - `dashboard-page-orchestrator`
  - `dashboard-shell`
  - `crud-manager`
  - `chart-card`
  - `data-table`
  - `status-badge`
  - `empty-state-panel`

After replacing files:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```
