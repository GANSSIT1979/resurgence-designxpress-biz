# QUICKSTART

Updated: 2026-05-05

```bash
cp .env.example .env
npm install
npm run local:preflight
npm run prisma:generate
npm run dev
```

Production-style validation:

```bash
npm run type-check
npm run lint
npm run build
npx prisma migrate status
```
