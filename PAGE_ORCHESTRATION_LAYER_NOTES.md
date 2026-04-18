# Page Orchestration Layer Pack

Included:
- `src/components/dashboard-page-orchestrator.tsx`
- `src/app/admin/layout.tsx`
- `src/app/admin/page.tsx`
- `src/app/cashier/layout.tsx`
- `src/app/cashier/page.tsx`
- `src/app/sponsor/dashboard/layout.tsx`
- `src/app/sponsor/dashboard/page.tsx`

What this layer changes:
- makes sponsor, admin, and cashier dashboards use one shared orchestration pattern
- unifies hero blocks, tabs, metrics, actions, and content flow
- applies the newer semantic components consistently
- improves readability without changing the underlying business model

After replacing files:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```
