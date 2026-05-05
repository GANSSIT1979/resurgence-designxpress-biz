# Troubleshooting Runbook

Updated: 2026-05-05

## Prisma EPERM On Windows

Error:

```txt
EPERM: operation not permitted, rename query_engine-windows.dll.node.tmp -> query_engine-windows.dll.node
```

Cause: a Node process, Next.js dev server, VS Code TypeScript server, or antivirus is holding the Prisma engine file open.

Fix:

```bash
taskkill //F //IM node.exe
taskkill //F //IM next.exe 2>/dev/null || true
rm -rf node_modules/.prisma
npm run prisma:generate
npm run build
```

If needed, close VS Code and retry.

## `migrate dev` Shadow Database Failure

Error:

```txt
P3006
P1014
The underlying table for model `PlatformNotification` does not exist.
```

Fix for the current existing Supabase/PostgreSQL workflow:

```bash
npm run db:push
npm run prisma:generate
```

Do not use `migrate dev` against the current production database until migration history is baselined.

## Missing Database Table At Runtime

Error:

```txt
The table `public.Partner` does not exist in the current database.
```

Fix:

```bash
npm run db:push
npm run prisma:generate
```

Verify with `to_regclass` cast to text:

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

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => prisma.$disconnect())
NODE
```

## Prisma Cannot Deserialize `regclass`

Error:

```txt
Failed to deserialize column of type 'regclass'
```

Fix: cast to text.

```sql
to_regclass('public."Partner"')::text
```

## `DATABASE_URL` Missing On Vercel

Runtime log:

```txt
Environment variable not found: DATABASE_URL.
```

Fix:

```bash
npx vercel env add DATABASE_URL production
npx vercel env add DIRECT_URL production
npx vercel env add PRISMA_DB_PROVIDER production
```

`DATABASE_URL` is the app and Prisma runtime source of truth. `POSTGRES_URL*` helper values do not replace it unless you intentionally map them.

## Google Login Button Missing

Common causes:

- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` missing in Vercel.
- Google Authorized JavaScript origin missing.
- Google script blocked by browser settings.
- Login tab is not set to Google.

Fix:

- Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID`.
- Set `GOOGLE_CLIENT_ID` to the same OAuth client ID.
- Redeploy after env changes.
- Confirm Google Cloud origins include the active domain.

## Google Login Build Warning Or Error

If TypeScript says:

```txt
Block-scoped variable 'continueWithGoogle' used before its declaration.
```

Fix: ensure `continueWithGoogle = useCallback(...)` is declared before the Google button `useEffect` that depends on it.

Expected order:

```txt
continueWithGoogle = useCallback
shouldRenderGoogleButton
```

## Vercel `403 Forbidden` During Auth

Likely causes:

- Deployment Protection blocks the OAuth route.
- Preview URL is protected.
- Middleware blocks an auth route.

Fix:

- Test on the production domain or disable deployment protection for the test domain.
- Ensure `/login` and `/api/auth/google` are public.
- Redeploy after env changes.

## Wrong Vercel Alias Command

Wrong:

```bash
npx vercel alias set <deployment> www.resurgence-dx.biz
```

Correct:

```bash
npx vercel alias set resurgence-designxpress-example.vercel.app www.resurgence-dx.biz --scope resurgence-designxpress-projects
```

Do not type angle brackets literally.

## Git Bash Command Mistakes

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

## Expo Mobile Type Errors In Web Build

Error:

```txt
Cannot find module 'expo-router'
```

Fix: ensure root `tsconfig.json` excludes mobile app sources from the web build.

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

## Empty Migration Generated

If a migration diff creates only:

```sql
-- This is an empty migration.
```

Delete it:

```bash
rm -rf prisma/migrations/<empty-migration-folder>
```

Do not commit empty migrations.

## Raw `<img>` Lint Warnings

Warning:

```txt
@next/next/no-img-element
```

Fix incrementally, one component at a time. Convert safe static images to `next/image` first. Avoid broad JSX rewrites across large feed/shop/admin components in one patch.

## Standard Recovery Validation

```bash
npm run type-check
npm run lint
npm run build
npx prisma migrate status
```
