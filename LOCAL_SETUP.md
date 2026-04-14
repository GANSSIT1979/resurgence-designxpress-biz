# Local Setup Guide

## Requirements

- Node.js 20+
- npm
- SQLite (no separate service required for local mode)

## Steps

1. Copy the environment file.

```bash
cp .env.example .env
```

2. Confirm local provider values.

```env
PRISMA_DB_PROVIDER=sqlite
DATABASE_URL="file:./dev.db"
```

3. Install dependencies.

```bash
npm install
```

4. Generate Prisma client.

```bash
npm run prisma:generate
```

5. Push the schema to the local SQLite database.

```bash
npm run db:push
```

6. Seed the database.

```bash
npm run db:seed
```

7. Start development.

```bash
npm run dev
```

8. Test the key flows.

### Public
- Home page loads
- Submit inquiry from `/contact`
- Submit sponsor application from `/sponsor/apply`

### Admin
- Login as `admin@resurgence.local`
- Open `/admin`
- Test sponsor CRUD, partner CRUD, creator CMS, gallery CMS, sponsor inventory CMS

### Cashier
- Login as `cashier@resurgence.local`
- Open `/cashier`
- Create invoice, add transaction, create receipt
- Check `/api/cashier/reports/summary`

### Sponsor Portal
- Login as `sponsor@resurgence.local`
- Open `/sponsor/dashboard`
- Confirm sponsor-scoped applications, deliverables, billing, and profile

## Local storage note

Uploads are written to:

```text
/public/uploads
```

For local development this is fine. For production serverless deployments, migrate uploads to object storage later.
