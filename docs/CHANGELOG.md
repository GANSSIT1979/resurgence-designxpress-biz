# CHANGELOG

Updated: 2026-04-23
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
