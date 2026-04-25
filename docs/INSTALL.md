# Install

## Environment

Copy the root environment example file:

```bash
cp ../.env.example .env
```

When reading this document from the repository root, use:

```bash
cp .env.example .env
```

The canonical template is:

[.env.example](../.env.example)

## Local setup

```bash
npm install
npm run local:preflight
npm run prisma:prepare
npm run dev
```

## Production deployment

```bash
npm run vercel-build
npx vercel --prod
```

To assign the latest deployment to the production domain, replace the deployment URL with the real Vercel deployment URL:

```bash
npx vercel alias set resurgence-designxpress-qo92fzor4.vercel.app www.resurgence-dx.biz --scope resurgence-designxpress-projects
```

Do not run this placeholder literally:

```bash
npx vercel alias set resurgence-designxpress-qo92fzor4.vercel.app www.resurgence-dx.biz --scope resurgence-designxpress-projects
```
