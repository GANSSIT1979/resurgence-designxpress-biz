# Server-Backed Workflow Pack

This pack moves saved views from browser-only local storage into the database and upgrades row and bulk actions to execute through server APIs.

Included:
- Prisma schema patch for `SavedView`
- server-backed saved views API
- generic bulk API route
- server saved views hook
- upgraded `CrudManager`
- advanced row actions
- server-backed bulk actions
- CSS snippet for workflow menu and summary UI

## What this enables

- saved filter presets persist per authenticated user
- saved views follow the user across browsers/devices
- row actions include duplicate, quick status change, copy JSON, and delete
- bulk delete and bulk status change execute on the server

## Schema step

Add the relation to `User` and the `SavedView` model from:

- `prisma/SAVED_VIEW_SCHEMA_PATCH.prisma.txt`

Then run:

```powershell
npm run prisma:generate
npm run db:push
```

## Files to replace or add

Replace:
- `src/components/crud-manager.tsx`
- `src/components/saved-views-bar.tsx`
- `src/components/workflow-row-actions.tsx`
- `src/components/workflow-bulk-actions.tsx`

Add:
- `src/hooks/use-server-saved-views.ts`
- `src/app/api/saved-views/route.ts`
- `src/app/api/saved-views/[id]/route.ts`
- `src/app/api/bulk/[resource]/route.ts`

Append:
- `workflow-server-backed-snippet.css.txt` to `src/app/globals.css`

## Supported bulk resources in this pack

- sponsor-applications
- admin-inquiries
- admin-gallery
- cashier-invoices
- cashier-receipts

## Notes

- `CrudManager` auto-infers the bulk endpoint from the main endpoint for the resources above
- saved views are keyed by `scope`
- duplicate row uses the existing POST endpoint after stripping system fields
- quick status actions appear only if a status field/options are available
