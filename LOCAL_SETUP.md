# Local Setup Guide

This guide is aligned to the **current working local setup** for the RESURGENCE project.

## Supported local baseline

- **Recommended Node.js:** 20.x
- **Package manager:** npm
- **Prisma:** 6.x
- **Local database:** SQLite
- **AI support:** optional

## Important notes before starting

- The project is currently aligned to **Node 20.x**.  
  If you use Node 24, npm may show an `EBADENGINE` warning, but the app can still install and run locally.
- The base install is designed to work **without** `@openai/agents`.
- Prisma commands rely on a successful `npm install` first.

## Windows PowerShell setup

1. Copy the environment file.

```powershell
Copy-Item .env.example .env
```

2. Confirm local provider values in `.env`.

```env
PRISMA_DB_PROVIDER=sqlite
DATABASE_URL="file:./dev.db"
AUTH_SECRET="replace-with-a-strong-random-secret"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

3. Install dependencies.

```powershell
npm install
```

4. Generate Prisma Client.

```powershell
npm run prisma:generate
```

5. Push the schema to the local SQLite database.

```powershell
npm run db:push
```

6. Seed demo data.

```powershell
npm run db:seed
```

7. Start development.

```powershell
npm run dev
```

8. Open:

```text
http://localhost:3000
```

## Optional Windows helper flow

If the helper script exists in your project, you can use:

```powershell
npm run setup:windows
npm run dev
```

## macOS / Linux / Git Bash setup

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run db:push
npm run db:seed
npm run dev
```

## Recommended local verification

After startup, verify these routes:

- `http://localhost:3000`
- `http://localhost:3000/login`
- `http://localhost:3000/contact`
- `http://localhost:3000/sponsor/apply`
- `http://localhost:3000/support`
- `http://localhost:3000/api/health`

## Demo credentials

- System Admin: `admin@resurgence.local` / `Admin123!`
- Cashier: `cashier@resurgence.local` / `Cashier123!`
- Sponsor: `sponsor@resurgence.local` / `Sponsor123!`
- Staff: `staff@resurgence.local` / `Staff123!`
- Partner: `partner@resurgence.local` / `Partner123!`

## Functional smoke test

### Public
- Home page loads
- Login page loads
- Submit inquiry from `/contact`
- Submit sponsor application from `/sponsor/apply`

### Admin
- Sign in as `admin@resurgence.local`
- Open `/admin`
- Test sponsor CRUD
- Test partner CRUD
- Test creator CMS
- Test gallery CMS
- Test sponsor inventory CMS

### Cashier
- Sign in as `cashier@resurgence.local`
- Open `/cashier`
- Create an invoice
- Add a transaction
- Create a receipt
- Check `/api/cashier/reports/summary`

### Sponsor Portal
- Sign in as `sponsor@resurgence.local`
- Open `/sponsor/dashboard`
- Confirm sponsor-scoped applications, deliverables, billing, and profile access

## Local storage note

Uploads are written to:

```text
/public/uploads
```

That is fine for local development. For production deployments, move uploads to object storage later.

## Troubleshooting

### `@prisma/client did not initialize yet`
Run:

```powershell
npm run prisma:generate
```

Then restart the dev server.

### `'prisma' is not recognized as an internal or external command`
`npm install` did not finish successfully. Install dependencies first, then rerun Prisma commands.

### Prisma 7 errors mentioning `prisma.config.ts`
This project is currently aligned to **Prisma 6.x**.  
If `npm install` failed and `npx` downloaded Prisma 7 temporarily, fix the install first, then run:

```powershell
npm install
npm run prisma:generate
```

### `tsx is not recognized`
This usually means `npm install` did not complete, so `tsx` was never installed.

### Login button or session state looks wrong
Clear cookies for `localhost:3000`, then refresh the browser.

### Sponsor or contact form throws a reset-related error
Use the latest patched build, then restart the dev server and retest.

### `npm warn EBADENGINE Unsupported engine`
The recommended fix is to switch to **Node 20 LTS**.  
The app may still run on newer Node versions, but Node 20.x is the supported target.

## Current setup summary

The current local setup is considered aligned when all of these are true:

- `npm install` completes successfully
- `npm run prisma:generate` completes successfully
- `npm run db:push` completes successfully
- `npm run db:seed` completes successfully
- `/api/health` returns `200`
- Home, login, contact, and sponsor apply pages all load correctly
