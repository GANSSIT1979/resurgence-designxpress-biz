# Database Migration Runbook

Prisma and Supabase/PostgreSQL workflow for RESURGENCE Powered by DesignXpress.

## Current database mode

The current production database is an existing Supabase/PostgreSQL database.

Use:

```bash
npm run db:push
npm run prisma:generate
```

Do not use `migrate dev` for the current production database workflow.

## Why `migrate dev` fails

This command currently fails:

```bash
npx prisma migrate dev --schema prisma/schema.generated.prisma --name <name>
```

Known error:

```txt
Error: P3006

Migration `20260419000000_add_creator_commerce_feed_schema` failed to apply cleanly to the shadow database.
Error code: P1014

The underlying table for model `PlatformNotification` does not exist.
```

Reason:

`migrate dev` replays the historical migration chain into a clean shadow database. One older migration references `PlatformNotification` before the table exists in that replay sequence.

This is a migration history/shadow database issue, not a live database connectivity issue.

## Production-safe schema sync

Run:

```bash
npm run db:push
npm run prisma:generate
```

Expected:

```txt
The database is already in sync with the Prisma schema.
✔ Generated Prisma Client
```

## Generate SQL diff for tracking

If a SQL migration file is needed for review, generate a diff from the live DB to the Prisma schema.

Load `DIRECT_URL`:

```bash
DIRECT_URL_VALUE=$(grep '^DIRECT_URL=' .env | sed 's/^DIRECT_URL=//' | sed 's/^"//' | sed 's/"$//')
test -n "$DIRECT_URL_VALUE" && echo "DIRECT_URL_VALUE loaded" || echo "DIRECT_URL_VALUE missing"
```

Generate diff:

```bash
npm run prisma:prepare

mkdir -p prisma/migrations/20260425000200_add_creator_affiliate_payout_system

npx prisma migrate diff   --from-url "$DIRECT_URL_VALUE"   --to-schema-datamodel prisma/schema.generated.prisma   --script   --output prisma/migrations/20260425000200_add_creator_affiliate_payout_system/migration.sql
```

Inspect:

```bash
cat prisma/migrations/20260425000200_add_creator_affiliate_payout_system/migration.sql
wc -l prisma/migrations/20260425000200_add_creator_affiliate_payout_system/migration.sql
```

If the migration contains only:

```sql
-- This is an empty migration.
```

delete it:

```bash
rm -rf prisma/migrations/20260425000200_add_creator_affiliate_payout_system
```

Empty migrations should not be committed.

## Verify required tables

Use Prisma raw query with `regclass` cast to text:

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
  .finally(async () => {
    await prisma.$disconnect()
  })
NODE
```

Expected:

```json
[
  {
    "partner_table": ""Partner"",
    "sponsor_table": ""Sponsor"",
    "creator_profile_table": ""CreatorProfile""
  }
]
```

## Baseline recommendation

Long term, rebuild/baseline the migration chain from the current production schema, then start a clean migration history from that baseline.

Until that is done, use:

```bash
npm run db:push
npm run prisma:generate
```
