# RESURGENCE Powered by DesignXpress

Deployable full-stack sponsorship, creator-network, gallery/media, sponsor inventory, and cashier platform built with **Next.js App Router + TypeScript + Prisma**.

## Stack

- Next.js App Router
- TypeScript
- Prisma ORM
- SQLite for local development
- PostgreSQL for production
- Signed JWT cookie authentication
- Responsive dashboard UI
- Docker-ready deployment
- Vercel / Railway / Render friendly structure

## What is included

### Public pages
- `/`
- `/about`
- `/services`
- `/sponsors`
- `/sponsor/apply`
- `/contact`
- `/support`
- `/creator/[slug]`

### Protected dashboards
- `/admin`
- `/cashier`
- `/sponsor/dashboard`
- `/staff`
- `/partner`

### Core modules
- Sponsor packages
- Sponsor submissions / review queue
- Creator network CMS
- Sponsor inventory CMS
- Sponsor CRUD
- Partner CRUD
- Inquiry workflow
- Content CMS
- Products & services CMS
- Gallery / media CMS with event grouping
- Users & roles
- Report snapshots + CSV / JSON export
- Settings storage
- Cashier invoices, transactions, receipts, summary endpoint
- Sponsor portal applications, deliverables, billing, and profile
- Upload route for `/public/uploads`
- Optional AI support placeholders

## Demo users

All seeded accounts are created with **hashed passwords only**.

| Role | Email | Password |
|---|---|---|
| System Admin | `admin@resurgence.local` | `Admin123!` |
| Cashier | `cashier@resurgence.local` | `Cashier123!` |
| Sponsor | `sponsor@resurgence.local` | `Sponsor123!` |
| Staff | `staff@resurgence.local` | `Staff123!` |
| Partner | `partner@resurgence.local` | `Partner123!` |

## Sponsor package seed data

- Supporting Sponsor — PHP 15,000–50,000
- Official Brand Partner — PHP 75,000–95,000
- Major Partner — PHP 120,000–150,000
- Event Presenting — Custom Proposal

## Seeded platform highlights

- 2.15M+ combined followers
- 2 active platforms
- 6 high-engagement creators

## Project structure

```text
resurgence-fullstack/
├─ app/
│  ├─ about/
│  ├─ admin/
│  ├─ api/
│  ├─ cashier/
│  ├─ contact/
│  ├─ creator/[slug]/
│  ├─ login/
│  ├─ partner/
│  ├─ services/
│  ├─ sponsor/
│  │  ├─ apply/
│  │  └─ dashboard/
│  ├─ sponsors/
│  ├─ staff/
│  ├─ support/
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
├─ components/
├─ lib/
├─ prisma/
│  ├─ schema.prisma
│  ├─ schema.template.prisma
│  └─ seed.ts
├─ public/uploads/
├─ scripts/
├─ Dockerfile
├─ docker-compose.yml
├─ middleware.ts
├─ package.json
├─ .env.example
├─ LOCAL_SETUP.md
└─ DEPLOYMENT.md
```

## Version notes

- The current project setup is aligned to **Prisma 6.x**
- The base project install is aligned to **Node 20.x**
- If you use **Node 24**, npm may show an `EBADENGINE` warning, but the app can still install and run locally
- The base build is designed to work **without** `@openai/agents`

## Quick start (Windows PowerShell)

1. Copy the environment file.

```powershell
Copy-Item .env.example .env
```

2. Install dependencies.

```powershell
npm install
```

3. Generate Prisma Client.

```powershell
npm run prisma:generate
```

4. Push the local database schema.

```powershell
npm run db:push
```

5. Seed demo data.

```powershell
npm run db:seed
```

6. Start the development server.

```powershell
npm run dev
```

7. Open:

```text
http://localhost:3000
```

## Quick start (macOS / Linux / Git Bash)

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run db:push
npm run db:seed
npm run dev
```

## Recommended local verification

After startup, verify:

```text
http://localhost:3000
http://localhost:3000/login
http://localhost:3000/sponsor/apply
http://localhost:3000/contact
http://localhost:3000/api/health
```

## Environment variables

```env
PRISMA_DB_PROVIDER=sqlite
DATABASE_URL="file:./dev.db"
AUTH_SECRET="replace-with-a-strong-random-secret"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

OPENAI_API_KEY=""
OPENAI_WORKFLOW_ID=""
OPENAI_WEBHOOK_SECRET=""
```

## Provider switching

This project is **provider-aware** through the Prisma prepare script.

### Local SQLite
```env
PRISMA_DB_PROVIDER=sqlite
DATABASE_URL="file:./dev.db"
```

### Production PostgreSQL
```env
PRISMA_DB_PROVIDER=postgresql
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?schema=public"
```

Then run:

```bash
npm run prisma:generate
npm run db:push
npm run db:seed
```

## Authentication

- Signed JWT cookie session
- Password hashing via `bcryptjs`
- Middleware-protected dashboard routes
- API role checks on protected endpoints
- Sponsor portal is sponsor-scoped through `sponsorId`
- Broken or stale session cookies should be cleared automatically by the middleware/auth flow

## Upload handling

Uploads are accepted by:

```text
POST /api/upload
```

Files are stored in:

```text
/public/uploads
```

The admin CRUD UI supports direct image upload on image fields.

## Cashier module details

### Models
- `Invoice`
- `CashierTransaction`
- `Receipt`
- `Counter`

### Features implemented
- Create / edit / delete invoices
- Record collections
- Record refunds
- Record adjustments
- Recalculate invoice balances after transaction changes
- Receipt numbering
- Aging bucket reporting
- Summary endpoint
- CSV / JSON export
- Print pages for invoices and receipts

### Summary endpoint
```text
GET /api/cashier/reports/summary
```

### Document numbering
Invoice and receipt numbers are generated through a dedicated `Counter` model, so deleted records do **not** cause reused numbers.

## Sponsor portal APIs

- `GET /api/sponsor/applications`
- `GET /api/sponsor/deliverables`
- `GET /api/sponsor/profile`
- `POST /api/sponsor/profile`
- `GET /api/sponsor/billing`
- `GET /api/sponsor/packages`

## Public workflow APIs

- `POST /api/inquiries`
- `POST /api/sponsor-applications`

## Admin exports

- `GET /api/admin/reports/export?dataset=inquiries&format=csv`
- `GET /api/admin/reports/export?dataset=sponsors&format=json`

## AI support status

The app includes `/support` and AI-related placeholders, but the **base install is intentionally non-AI-first** so the project can build cleanly without the OpenAI Agents SDK.

### Available in the base build
- `/support`
- `POST /api/chatkit/session`
- AI environment placeholders in `.env`

### Current behavior
- If optional AI packages are not installed, AI-specific routes should fail gracefully instead of breaking the whole app
- The base install does **not** require `@openai/agents`

### Important dependency note
The current base project uses:
- `openai` with **Zod 3**
- Prisma 6.x

If you plan to enable an Agents SDK implementation later, do it in a controlled pass because newer `@openai/agents` releases may require dependency versions that differ from the base project setup.

## Deployment

See:
- `LOCAL_SETUP.md`
- `DEPLOYMENT.md`

## Troubleshooting

### 1. `@prisma/client did not initialize yet`
Run:

```powershell
npm run prisma:generate
```

Then restart the dev server.

### 2. `'prisma' is not recognized as an internal or external command`
Make sure `npm install` finished successfully first. This project uses `npx prisma ...` in scripts, so Prisma must exist in local dependencies.

### 3. Prisma 7 schema errors mentioning `prisma.config.ts`
This project is currently aligned to **Prisma 6.x**. If `npm install` failed and `npx` downloaded Prisma 7 temporarily, fix the install first, then rerun:

```powershell
npm install
npm run prisma:generate
```

### 4. `tsx is not recognized`
This usually means `npm install` did not complete, so `tsx` was never installed.

### 5. Login button keeps sending you to the wrong state
Clear cookies for `localhost:3000` once, then refresh the page.

### 6. Sponsor or contact form throws a form reset error
Update to the patched build that captures the form element before async submission. If you are on the latest patched project, restart the dev server and retest.

### 7. Node version warning
If you see:

```text
npm warn EBADENGINE Unsupported engine
```

the recommended fix is to switch to **Node 20 LTS**. The app may still run on newer Node versions, but Node 20.x is the supported target for this project.

## Notes

- This scaffold is modular and extendable
- The admin CRUD pages are intentionally generic so new modules can be added quickly
- For production, use PostgreSQL and set a strong `AUTH_SECRET`
- For Vercel deployments, use a persistent PostgreSQL database and avoid relying on local file storage for long-term uploads unless you add object storage later
