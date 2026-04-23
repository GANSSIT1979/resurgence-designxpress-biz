# QUICKSTART

Updated: 2026-04-23
## Site Type

- Exact category: `React/Node`
- Framework: `Next.js 15` App Router
- Runtime expectation: use `npm` with `Node.js 20.x`
- Do not treat this repo as WordPress, Laravel/PHP, or a static export-only site

## Fast Local Startup

```bash
cp .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

Local HTTPS:

```bash
npm run dev:https
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

Provider note:

- if you changed `PRISMA_DB_PROVIDER` or `DATABASE_URL`, run `npm run prisma:generate` before `npm run build`
- if neither is set, the Prisma prep step falls back to SQLite for local development
- `DATABASE_URL` is the current database source of truth for Prisma in this repo

## Key URLs

- Public site: `http://localhost:3000`
- Local HTTPS site: `https://localhost:3000` with `npm run dev:https`
- Login and signup: `http://localhost:3000/login`
- Member dashboard: `http://localhost:3000/member`
- Community feed: `http://localhost:3000/feed`
- Shop: `http://localhost:3000/shop`
- Support: `http://localhost:3000/support`
- Health: `http://localhost:3000/api/health`

## Fast Role Check

Seeded local accounts:

1. Sign in as admin and open `/admin`
2. Sign in as cashier and open `/cashier`
3. Sign in as sponsor and open `/sponsor/dashboard`
4. Sign in as staff and open `/staff`
5. Sign in as partner and open `/partner`
6. Sign in as creator and open `/creator/dashboard`

Self-service public signup checks:

1. Create a free member account from `/login` and open `/member`
2. Create a coach account from `/login` and open `/coach`
3. Create a referee account from `/login` and open `/referee`

## Verification

```bash
npx tsc --noEmit --pretty false
npm run build
```

Support verification against a running local app:

```bash
npm run support:verify -- --base-url=http://localhost:3000
```

Production-style verification:

```bash
npm run support:verify -- --base-url=https://your-domain.example --webhook-secret=whsec_...
```

## What Success Looks Like

- the public site loads
- `/login` supports both sign-in and public account creation
- `/member`, `/feed`, `/shop`, and `/support` all load
- seeded role accounts can enter their protected workspaces
- `/api/health` returns `200`
- `npx tsc --noEmit --pretty false` passes
- `npm run build` passes
- support verification completes without failures
