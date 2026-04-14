# QUICKSTART

## Fastest Local Startup

```bash
npm install
npm run prisma:generate
npm run db:push
npm run db:seed
npm run dev
```

## Local URLs

- Public site: http://localhost:3000
- Login: http://localhost:3000/login
- Support: http://localhost:3000/support
- Sponsor Apply: http://localhost:3000/sponsor/apply
- Contact: http://localhost:3000/contact

## Seeded Demo Roles

Use the seeded credentials configured in your seed script. Typical examples:

- System Admin
- Cashier
- Sponsor
- Staff
- Partner

Check your seed file for the exact emails and passwords currently used.

## Smoke Test Checklist

Open and verify:

- `/`
- `/about`
- `/services`
- `/sponsors`
- `/sponsor/apply`
- `/contact`
- `/support`
- `/login`

Then verify dashboards:

- System Admin dashboard
- Cashier dashboard
- Sponsor dashboard

## Minimal Success Criteria

The app is considered healthy locally when:

- public pages load
- login works
- dashboards render
- Prisma queries succeed
- seeded data appears
- no missing delegate errors appear in the console

## Quick Recovery Commands

```bash
rm -rf .next
npm run prisma:generate
npm run dev
```

On Windows PowerShell:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run prisma:generate
npm run dev
```
