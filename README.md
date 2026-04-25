# Repo health/docs fix bundle

Copy these files into the repo root:

```txt
.env.example
scripts/devops-health-gate.mjs
scripts/generate-production-status.mjs
docs/INSTALL.md
docs/README.md
```

## Fixes

- Restores missing root `.env.example`
- Fixes Markdown links to `.env.example`
- Adds missing `scripts/devops-health-gate.mjs`
- Adds compatibility wrapper `scripts/generate-production-status.mjs`
- Keeps existing commands working:
  - `node scripts/devops-health-gate.mjs`
  - `node scripts/generate-production-status.mjs --check`

## Verify

```bash
npm run prisma:generate
npm run docs:production-status
npm run docs:production-status:check
npm run docs:check
npm run local:preflight
node scripts/generate-production-status.mjs --check
node scripts/devops-health-gate.mjs
```
