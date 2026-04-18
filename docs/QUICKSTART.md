# QUICKSTART

Updated: 2026-04-19

## Fast Local Startup

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

If you switched providers, run `npm run prisma:generate` first.

## Key URLs

- Public site: `http://localhost:3000`
- Login: `http://localhost:3000/login`
- Contact: `http://localhost:3000/contact`
- Sponsor Apply: `http://localhost:3000/sponsor/apply`
- Support: `http://localhost:3000/support`
- Health: `http://localhost:3000/api/health`

## Fast Role Check

1. Sign in as the admin user and open `/admin`
2. Sign in as the cashier user and open `/cashier`
3. Sign in as the sponsor user and open `/sponsor/dashboard`
4. Sign in as the staff user and open `/staff`
5. Sign in as the partner user and open `/partner`

## Support Verification

Run this while the app is already serving locally:

```bash
npm run support:verify -- --base-url=http://localhost:3000
```

Production-style verification:

```bash
npm run support:verify -- --base-url=https://your-domain.example --webhook-secret=whsec_...
```

## What Success Looks Like

- the public site loads
- login works for seeded users
- `/api/health` returns `200`
- `npx tsc --noEmit --pretty false` passes
- `npm run build` passes
- support verification completes without failures
