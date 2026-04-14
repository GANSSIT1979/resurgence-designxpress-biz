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
- Future AI support placeholders

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
│  └─ seed.ts
├─ public/uploads/
├─ Dockerfile
├─ docker-compose.yml
├─ middleware.ts
├─ package.json
└─ .env.example
```

## Local setup

1. Copy environment values.

```bash
cp .env.example .env
```

2. Install packages.

```bash
npm install
```

3. Generate Prisma client.

```bash
npm run prisma:generate
```

4. Create the local database.

```bash
npm run db:push
```

5. Seed demo data.

```bash
npm run db:seed
```

6. Start development.

```bash
npm run dev
```

7. Open:

```text
http://localhost:3000
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

This project is **provider-aware** through Prisma environment variables.

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

## AI support readiness

Prepared routes:
- `/support`
- `POST /api/chatkit/session`
- `POST /api/openai/webhook`

## Deployment

See:
- `LOCAL_SETUP.md`
- `DEPLOYMENT.md`

## Notes

- This scaffold is modular and extendable.
- The admin CRUD pages are intentionally generic so new modules can be added quickly.
- For production, use PostgreSQL and set a strong `AUTH_SECRET`.
- For Vercel deployments, use a persistent PostgreSQL database and avoid ephemeral file uploads unless paired with object storage later.


## AI Support Desk

This project includes a persistent RESURGENCE support desk at `/support`.

What it does:
- generates or reuses a browser-stable `conversationId`
- stores conversation state in Prisma with `ChatConversation` and `ChatMessage`
- keeps `leadCaptured` in the database so the assistant does not repeatedly ask for the same business details
- exposes APIs at `/api/chatkit/session`, `/api/chatkit/message`, and `/api/chatkit/lead`
- routes first-time captured leads into `Inquiry`, `EmailQueue`, and admin `Notification` records

Setup after pulling this patch:

```bash
npm install
npm run prisma:generate
npm run db:push
npm run db:seed
npm run dev
```

Required environment variable for live AI replies:

```env
OPENAI_API_KEY="your-api-key"
```
