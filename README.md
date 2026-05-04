# RESURGENCE UI Routing Repair Patch

This patch repairs production subdomain routing and auth-loop behavior.

## Included

- middleware.ts
- src/middleware.ts
- src/config/subdomain-routes.ts
- docs/deployment/ui-routing-repair.md

## Apply

```bash
cp -R resurgence-ui-routing-repair/* .
npm run build
npx prisma migrate status
git add middleware.ts src/middleware.ts src/config/subdomain-routes.ts docs/deployment/ui-routing-repair.md
git commit -m "Repair subdomain routing and public module access"
git push origin main
```
