# Resurgence Update Package

This ZIP contains the latest update layer for `resurgence-designxpress-biz`:

- production documentation system
- automated production status validation
- DevOps monitoring scripts/workflows
- deployment scoring and last-known-good tracking
- Expo mobile starter for Android/iOS
- TikTok-style feed + monetization overlay
- creator affiliate/commission schema draft

Copy these files into the matching paths in your repo, then review before committing.

## Recommended apply flow

```bash
# from repo root
cp -R <unzipped-package>/* .
npm install
npm run prisma:prepare
npm run prisma:generate
npm run docs:check
npm run vercel-build
```

## Important

`prisma/affiliate-schema-addition.prisma` is intentionally a draft extension. Copy the enums/models into `prisma/schema.prisma`, then create a migration.

```bash
npm run prisma:prepare
npx prisma migrate dev --schema prisma/schema.generated.prisma --name add_affiliate_system
```
