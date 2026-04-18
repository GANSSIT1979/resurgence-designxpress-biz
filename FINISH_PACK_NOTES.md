# Finish Pack

This pack consolidates the remaining stabilization work into one schema-aligned implementation layer.

Included:
- premium shared components
- finalized globals.css
- admin, sponsor, and cashier layouts/pages
- consistent API routes for admin, sponsor, and cashier modules
- schema-aligned helpers

Main outcomes:
- schema-aligned page conversions
- API consistency across admin, sponsor, and cashier modules
- premium CSS and shared component adoption
- fewer route-by-route inconsistencies

Before applying:
- make sure your auth layer exports `getCurrentUser` and `getApiUser`
- make sure `src/lib/db.ts` is already working
- keep `/api/upload` if you want the image upload field to function

Recommended apply order:
1. replace shared components and `src/app/globals.css`
2. replace layouts and page files
3. add the API routes
4. run Prisma generate
5. restart the dev server

Commands:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run prisma:generate
npm run dev
```
