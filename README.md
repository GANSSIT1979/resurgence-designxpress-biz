# RESURGENCE Subdomain Middleware Patch

Copy these files into the repo root.

## Included

- `src/app/crm/leads/page.tsx`
- `src/app/support/tickets/page.tsx`
- `src/middleware.ts`
- `middleware.ts`

## Required env vars

```env
NEXT_PUBLIC_ROOT_DOMAIN=resurgence-dx.biz
FORCE_HTTPS=true
```

## Verify

```bash
npm run build
git add src/middleware.ts middleware.ts src/app/crm/leads/page.tsx src/app/support/tickets/page.tsx
git commit -m "Add production subdomain middleware and nested module routes"
git push origin main
```
