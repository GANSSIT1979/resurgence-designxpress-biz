# Runtime Verification

Updated: 2026-05-05

Run after build passes and before release promotion.

```bash
npm run type-check
npm run lint
npm run build
npx prisma migrate status
```

Expected: type-check passes, build passes, Prisma schema is up to date, and lint has warnings only or passes cleanly.
