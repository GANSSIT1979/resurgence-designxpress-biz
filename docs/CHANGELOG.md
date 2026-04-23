# CHANGELOG

Updated: 2026-04-24
## 2026-04-24

### Documentation Accuracy Pass

- normalized canonical docs so verification language reads as repeatable branch and environment checks instead of standing guarantees
- aligned README, install, quickstart, testing, runtime, deployment, API, database, security, Vercel, architecture, shop, and user-facing docs to the same source-of-truth wording style
- replaced the remaining real-looking Supabase host and project-ref examples in tracked docs with neutral placeholders and added explicit secret-hygiene guidance for markdown and env examples
- completed a docs integrity sweep: relative markdown links are clean, stale repo-path references were corrected, and the canonical docs index now includes the remaining migration SQL and historical planning artifacts
- added `npm run docs:check` to make Markdown link and local file-reference validation repeatable
- refreshed `scripts/local-preflight.mjs` to match the current `JWT_SECRET` and generated-schema workflow, and exposed it as `npm run local:preflight`
- converted `scripts/prepare-prisma.mjs` into a compatibility shim for `scripts/prepare-prisma-schema.mjs` and updated `scripts/check-resurgence-stack.ps1` to the current `src/` App Router architecture

## 2026-04-23

### Repo-Wide Markdown Refresh

- refreshed the operational docs for install, configuration, database, deployment, security, testing, troubleshooting, runtime verification, user guidance, and admin guidance
- aligned the docs with the generated Prisma schema flow, Cloudflare Stream upload path, creator studio routes, feed interactions, and health-route schema probes
- marked the current production drift examples more accurately around additive `ContentPost` columns instead of older generic missing-table wording

### Earlier 2026-04-23 Documentation Work

- refreshed the root `README.md` and canonical `docs/` overview pages to reflect the live route map
- documented the member dashboard, community feed, and free public signup flows more clearly
- updated architecture and API docs to include Google auth, mobile OTP auth, feed interactions, creator actions, notifications, and support routing categories
- refreshed the merch module guide to describe how shop flows intersect with the member dashboard and creator-commerce feed

## 2026-04-19

### Repository Health

- verified that `npx tsc --noEmit --pretty false` passes
- verified that `npm run build` passes
- verified that `npm run support:verify` passes against a running local app

### Documentation Alignment

- updated the root readmes and the `docs/` set to match the repaired codebase
- removed stale references to build blockers that no longer exist
- documented creator dashboard access for configured `CREATOR` role users
- corrected current script names, API paths, route redirects, and demo credentials

## 2026-04-16

### Earlier Docs Pass

- standardized the documentation structure
- documented the support verifier and workflow environment variables
