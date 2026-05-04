# RESURGENCE UI and Subdomain Routing Repair

## Fixes included

- Prevents repeated `/admin/login?next=...` redirect loops.
- Keeps public subdomains public: events, shop, partnership, support, feed.
- Rewrites subdomains to the correct module paths without double-prefixing.
- Keeps root middleware as a thin export wrapper.
- Adds shared subdomain route config.

## Routes expected

- admin.resurgence-dx.biz -> /admin, login-gated
- crm.resurgence-dx.biz -> /crm, login-gated
- login.resurgence-dx.biz -> /login
- events.resurgence-dx.biz -> /events
- shop.resurgence-dx.biz -> /shop
- partnership.resurgence-dx.biz -> /partnerships
- support.resurgence-dx.biz -> /support
- feed.resurgence-dx.biz -> /feed
- www.resurgence-dx.biz -> /
- resurgence-dx.biz -> redirects to www

## Apply

Copy the files into the repo root, then run:

```bash
npm run build
npx prisma migrate status
git add middleware.ts src/middleware.ts src/config/subdomain-routes.ts docs/deployment/ui-routing-repair.md
git commit -m "Repair subdomain routing and public module access"
git push origin main
```

Do not run `prisma migrate dev` against production Supabase.
