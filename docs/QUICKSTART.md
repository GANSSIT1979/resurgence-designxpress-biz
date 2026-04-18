# QUICKSTART

Updated: 2026-04-16

## Fast Local Startup

```bash
npm install
npm run prisma:generate
npm run db:push
npm run db:seed
npm run dev
```

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
4. Open `/support` and send one message for each support category

## Support Verification

Local verification:

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
- the support desk loads and stores conversation state
- `/api/chatkit/session` returns readiness metadata
- `/api/health` returns `200`

## Current Caveat

Use this quickstart for local work and focused feature testing. Do not treat it as proof that the full repository is build-green until the blockers in `TROUBLESHOOTING.md` are cleared.
