# Alias and DashboardShell Fix

This patch fixes the root import problem for the `src/` app structure.

## What it does

1. Restores the TypeScript / Next alias:
   - `@/*` -> `./src/*`

2. Adds a standalone component:
   - `src/components/dashboard-shell.tsx`

## Why this matters

Your project contains many imports like:

- `@/lib/db`
- `@/lib/auth`
- `@/components/dashboard-shell`
- `@/components/kpi-grid`

If the alias is missing or wrong, Next.js will fail with repeated
`Module not found` errors across pages, layouts, and API routes.

## Apply

Replace or create:

- `tsconfig.json`
- `src/components/dashboard-shell.tsx`

Then restart the dev server.

## Restart steps

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```

## Important

If `tsconfig.json` already has other important custom settings,
merge the `baseUrl` and `paths` section instead of overwriting the whole file.
