# Status and Data Semantics Pack

Included:
- `src/components/status-badge.tsx`
- `src/components/dashboard-filters.tsx`
- `src/components/dashboard-tabs.tsx`
- `src/components/empty-state-panel.tsx`
- `src/components/loading-state-panel.tsx`
- `status-data-semantics-snippet.css.txt`

What this layer solves:
- unified status badges for sponsor, admin, cashier, inquiries, invoices, and submissions
- standardized filters with search and status select
- reusable dashboard tabs for sponsor/admin/cashier sub-pages
- premium empty-state and loading-state panels
- consistent pills and semantic visual hierarchy

Add:
- all component files to `src/components`

Append:
- the CSS snippet into `src/app/globals.css`

Typical usage:
- use `StatusBadge` in table cells and summary cards
- use `DashboardFilters` above module tables
- use `DashboardTabs` for sponsor/admin/cashier dashboard subsections
- use `EmptyStatePanel` instead of raw empty text blocks
- use `LoadingStatePanel` while async module data is loading

After replacing files:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```
