# Installation Guide

Local setup for RESURGENCE Powered by DesignXpress.

## Requirements

Recommended runtime:

- Node.js 20.x for Vercel compatibility
- npm 10+
- PostgreSQL/Supabase database
- Vercel CLI
- Git Bash or PowerShell on Windows

Check versions:

```bash
node -v
npm -v
```

## Clone and install

```bash
git clone https://github.com/GANSSIT1979/resurgence-designxpress-biz.git
cd resurgence-designxpress-biz
npm install
```

## Environment files

Required local files:

```txt
.env
.env.local
```

Required database variables:

```env
DATABASE_URL="postgres://..."
DIRECT_URL="postgres://..."
PRISMA_DB_PROVIDER="postgresql"
```

Use pooled connection for app runtime and direct/non-pooling connection for schema operations when possible.

## Prisma setup

Prepare the generated schema:

```bash
npm run prisma:prepare
```

Generate Prisma Client:

```bash
npm run prisma:generate
```

Validate generated schema:

```bash
npx prisma validate --schema prisma/schema.generated.prisma
```

## Local build

```bash
npm run vercel-build
```

Expected success:

```txt
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

## Local checks

```bash
npm run docs:check
npm run local:preflight
node scripts/devops-health-gate.mjs
```

## Common Windows Prisma EPERM fix

If Prisma fails with:

```txt
EPERM: operation not permitted, rename query_engine-windows.dll.node
```

Stop running Node processes:

```bash
taskkill //F //IM node.exe
taskkill //F //IM next.exe 2>/dev/null || true
```

Then regenerate:

```bash
rm -rf node_modules/.prisma
npm run prisma:generate
npm run vercel-build
```

## Expo mobile app note

The Expo app lives under:

```txt
apps/mobile
```

The root Next.js TypeScript build excludes `apps/mobile` so web deployment does not require Expo dependencies.
