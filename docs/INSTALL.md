# INSTALL

Updated: 2026-04-16

## Requirements

- Node.js 20.x
- npm 10+
- SQLite for local development
- PostgreSQL for production deployments
- OpenAI credentials only if you are enabling production AI support

## Install Steps

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run db:push
npm run db:seed
npm run dev
```

Windows PowerShell equivalent:

```powershell
Copy-Item .env.example .env
npm install
npm run prisma:generate
npm run db:push
npm run db:seed
npm run dev
```

## First Local Checks

- Open `http://localhost:3000`
- Open `http://localhost:3000/login`
- Open `http://localhost:3000/support`
- Open `http://localhost:3000/api/health`

## Demo Accounts

- System Admin: `admin@resurgence.local` / `Admin123!`
- Cashier: `cashier@resurgence.local` / `Cashier123!`
- Sponsor: `sponsor@resurgence.local` / `Sponsor123!`
- Staff: `staff@resurgence.local` / `Staff123!`
- Partner: `partner@resurgence.local` / `Partner123!`

## Optional AI Support Setup

If you are preparing the AI customer service flow, also set:

```env
OPENAI_API_KEY=""
OPENAI_WORKFLOW_ID=""
OPENAI_WORKFLOW_VERSION=""
OPENAI_WEBHOOK_SECRET=""
OPENAI_DEFAULT_MODEL="gpt-4.1-mini"
```

## Important Current Note

The repository can be installed and run locally, but the entire codebase is not fully repaired yet. As of 2026-04-16, some legacy modules still fail full typecheck and production build. See `TROUBLESHOOTING.md` for the active blockers.
