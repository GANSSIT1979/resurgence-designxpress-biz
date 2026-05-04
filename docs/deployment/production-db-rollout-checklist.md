# Production DB Rollout Checklist

## Before migration

```bash
npm run prisma:generate
npm run build
```

Confirm:

- `DATABASE_URL` points to the intended database.
- Production secrets are in Vercel environment variables, not committed files.
- The migration is additive and nullable.
- No public UI depends on fields before migration is applied.

## Local / development

```bash
npx prisma migrate dev --name add_event_sponsor_system
npm run prisma:generate
npm run build
```

## Production / Vercel / Supabase

```bash
npx prisma migrate deploy
npm run build
```

## After migration

Check these routes:

- `/sponsors`
- `/sponsor/apply`
- `/events`
- `/events/dayo-series-ofw-all-star`
- `/events/dayo-series-ofw-all-star/apply`
- `/admin/events`
- `/admin/sponsor-crm`
- `/crm`

## Rollback posture

Because fields are nullable/additive, app rollback should not require immediate DB rollback. Do not drop tables or columns in this patch.
