# CONFIGURATION

Updated: 2026-04-16

## Core Environment Variables

### Database

```env
PRISMA_DB_PROVIDER=sqlite
DATABASE_URL="file:./dev.db"
```

Production:

```env
PRISMA_DB_PROVIDER=postgresql
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?schema=public"
```

### Authentication

```env
AUTH_SECRET="replace-with-a-strong-random-secret"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
PORT=3000
```

### AI Customer Service

```env
OPENAI_API_KEY=""
OPENAI_WORKFLOW_ID=""
OPENAI_WORKFLOW_VERSION=""
OPENAI_WEBHOOK_SECRET=""
OPENAI_DEFAULT_MODEL="gpt-4.1-mini"
```

## Prisma Configuration Flow

- source template: `prisma/schema.template.prisma`
- generated working schema: `prisma/schema.prisma`
- prepare script: `scripts/prepare-prisma.mjs`

Run Prisma commands through the provided npm scripts so the schema is prepared correctly before generate, push, migrate, or seed.

## Upload Configuration

- upload API: `POST /api/upload`
- local storage path: `public/uploads`
- current accepted file types: `jpeg`, `png`, `webp`, `gif`, `svg`
- current size limit: `5 MB`

## Support Route Configuration

- `/support` is the public entry point
- `/api/chatkit/session` exposes readiness metadata and ChatKit session creation
- `/api/openai/webhook` expects a valid OpenAI webhook signature when production support is enabled

## Current Advice

- keep local development on SQLite
- switch production deployments to PostgreSQL
- set all OpenAI support variables together when enabling production AI support
- move uploads to durable object storage before long-term production use
