# INSTALL

## System Requirements

Recommended:

- Node.js 20.x
- npm 10+
- Windows PowerShell, macOS Terminal, or Linux shell
- SQLite for local development
- PostgreSQL for production deployment

## Install Steps

### 1. Clone or extract the project

```bash
git clone <your-repository-url>
cd resurgence-fullstack
```

### 2. Copy environment variables

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

### 3. Install dependencies

```bash
npm install
```

### 4. Generate Prisma Client

```bash
npm run prisma:generate
```

### 5. Push schema to the local database

```bash
npm run db:push
```

### 6. Seed demo data

```bash
npm run db:seed
```

### 7. Start development server

```bash
npm run dev
```

### 8. Open the site

- http://localhost:3000

## Recommended Node Version

Use Node 20.x for best compatibility. If you are currently on Node 24 and see warnings only, the app may still work, but Node 20 is the safer supported baseline.

## Windows Notes

If `prisma` or `tsx` is not recognized:

- run `npm install` first
- use `npx prisma generate`
- use `npx tsx prisma/seed.ts`

If PowerShell blocks scripts:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

## If Prisma Client Fails to Initialize

Run:

```bash
npm run prisma:generate
```

Then restart the dev server.

## If You Changed the Schema

Always run:

```bash
npm run prisma:generate
npm run db:push
```
