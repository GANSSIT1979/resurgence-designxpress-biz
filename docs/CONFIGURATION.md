# CONFIGURATION

## Core Environment Variables

### Database
- `PRISMA_DB_PROVIDER`
- `DATABASE_URL`

Examples:

Local SQLite:
```env
PRISMA_DB_PROVIDER=sqlite
DATABASE_URL="file:./dev.db"
```

Production PostgreSQL:
```env
PRISMA_DB_PROVIDER=postgresql
DATABASE_URL="postgresql://user:password@host:5432/dbname"
```

### Auth
- `AUTH_SECRET`

Example:
```env
AUTH_SECRET="replace-this-with-a-long-random-secret"
```

### Site
- `NEXT_PUBLIC_SITE_URL`

Example:
```env
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

## Optional AI Variables

- `OPENAI_API_KEY`
- `OPENAI_DEFAULT_MODEL`
- `OPENAI_WORKFLOW_ID`
- `OPENAI_WEBHOOK_SECRET`

If these are not set, the support layer should either be disabled or gracefully degraded.

## Upload Behavior

Local uploads are expected under:
- `/public/uploads`

If you move to cloud storage later, document the new provider and update upload logic accordingly.

## Recommended .env Sections

```env
# Database
PRISMA_DB_PROVIDER=sqlite
DATABASE_URL="file:./dev.db"

# Auth
AUTH_SECRET="change-me"

# Site
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Optional AI
OPENAI_API_KEY=""
OPENAI_DEFAULT_MODEL="gpt-4.1-mini"
OPENAI_WORKFLOW_ID=""
OPENAI_WEBHOOK_SECRET=""
```

## Configuration Warnings

- never commit real secrets
- do not reuse development secrets in production
- if schema/provider preparation is automated, confirm it before deploy
- if JWT verification is used in middleware, keep auth helpers compatible with that runtime
