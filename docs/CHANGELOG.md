# CHANGELOG

## 2026-04-16

### Documentation Refresh

- refreshed the full active documentation set under `docs/`
- aligned root-level Markdown notes with the current repository state
- clarified that the current AI customer service routes are `/support`, `/api/chatkit/session`, `/api/chatkit/message`, and `/api/openai/webhook`
- documented `OPENAI_WORKFLOW_VERSION` and the `npm run support:verify` production verification flow
- cleaned up older wording that still described AI support as only a placeholder

### AI Customer Service

- documented workflow publishing, webhook signing, and production verification steps
- documented readiness behavior for sponsorships, events, custom apparel, and partnerships
- documented the support verifier command and expected route checks

### Repository Status Notes

- called out the current repository-wide build blockers honestly
- documented the known `@/lib/sponsor-server` build stop
- documented that `npx tsc --noEmit` still reports unrelated legacy module drift outside the AI support pass

## 2026-04-14

### Prior Documentation Pass

- standardized the initial `docs/` folder structure
- documented the provider-aware Prisma workflow
- aligned role-routing documentation with the `CREATOR` role and dashboard path
