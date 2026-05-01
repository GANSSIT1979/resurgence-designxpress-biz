# Troubleshooting Runbook

Known issues and exact fixes for RESURGENCE Powered by DesignXpress.

## Prisma EPERM on Windows

Error:

```txt
EPERM: operation not permitted, rename query_engine-windows.dll.node.tmp -> query_engine-windows.dll.node
```

Cause:

A Node process, Next.js dev server, VS Code TypeScript server, or antivirus is holding the Prisma engine file open.

Fix:

```bash
taskkill //F //IM node.exe
taskkill //F //IM next.exe 2>/dev/null || true
rm -rf node_modules/.prisma
npm run prisma:generate
npm run vercel-build
```

If needed, close VS Code and retry.

## `migrate dev` shadow database failure

Error:

```txt
P3006
P1014
The underlying table for model `PlatformNotification` does not exist.
```

Fix:

Do not use `migrate dev` for the current production database.

Use:

```bash
npm run db:push
npm run prisma:generate
```

See `DATABASE_MIGRATION_RUNBOOK.md`.

## Missing database table at runtime

Error:

```txt
The table `public.Partner` does not exist in the current database.
```

Fix:

```bash
npm run db:push
npm run prisma:generate
```

Verify:

```bash
node - <<'NODE'
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const rows = await prisma.$queryRaw`
    SELECT
      to_regclass('public."Partner"')::text AS partner_table,
      to_regclass('public."Sponsor"')::text AS sponsor_table,
      to_regclass('public."CreatorProfile"')::text AS creator_profile_table;
  `
  console.log(JSON.stringify(rows, null, 2))
}

main().finally(async () => prisma.$disconnect())
NODE
```

## Prisma cannot deserialize `regclass`

Error:

```txt
Failed to deserialize column of type 'regclass'
```

Fix:

Cast to text:

```sql
to_regclass('public."Partner"')::text
```

## `DATABASE_URL` missing on Vercel

Runtime log:

```txt
Environment variable not found: DATABASE_URL.
```

Fix:

Set Vercel production env values:

```bash
npx vercel env add DATABASE_URL production
npx vercel env add DIRECT_URL production
npx vercel env add PRISMA_DB_PROVIDER production
```

Use proper shell input. Do not type raw URLs as commands.

## Git Bash command mistakes

Wrong:

```bash
PREVIEW_SITE_URL
STAGING_SITE_URL
/api/health
```

Correct:

```bash
echo "$PREVIEW_SITE_URL"
echo "$STAGING_SITE_URL"
curl https://www.resurgence-dx.biz/api/health
```

## Wrong alias command

Wrong:

```bash
npx vercel alias set <deployment> www.resurgence-dx.biz
```

Correct:

```bash
npx vercel alias set resurgence-designxpress-r3k648gsb.vercel.app www.resurgence-dx.biz --scope resurgence-designxpress-projects
```

## Expo mobile type errors in web build

Error:

```txt
Cannot find module 'expo-router'
```

Cause:

Next.js web TypeScript build scanned `apps/mobile`.

Fix:

Ensure root `tsconfig.json` excludes:

```json
"exclude": [
  "node_modules",
  ".next",
  "out",
  "dist",
  "build",
  "coverage",
  "apps/mobile"
]
```

## Empty migration generated

If migration diff produces:

```sql
-- This is an empty migration.
```

Delete the folder:

```bash
rm -rf prisma/migrations/<empty-migration-folder>
```

Do not commit empty migrations.
