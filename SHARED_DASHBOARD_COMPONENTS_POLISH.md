# Shared Dashboard Components Polish

Replace:
- `src/components/CrudManager.tsx` or `src/components/crud-manager.tsx`
- `src/components/ChartCard.tsx` or `src/components/chart-card.tsx`
- `src/components/DataTable.tsx` or `src/components/data-table.tsx`

Notes:
- file names in your project may be lowercase; match the import path actually used
- these versions are styled to match the premium dashboard shell
- `CrudManager` supports common config props for endpoint, fields, columns, and defaults
- `ChartCard` supports bar, area, and line chart styles
- `DataTable` supports `rows` or `items`

After replacing files:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```
