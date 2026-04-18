# AGENTS.md

## Project identity
RESURGENCE Powered by DesignXpress is a Next.js + Prisma multi-role platform for:
- basketball community and brand operations
- custom jerseys, uniforms, and merchandise
- product and service selling
- creator profiles and media/gallery content
- sponsorships, partnerships, and quotation workflows
- dashboard and admin operations

Primary brand entities:
- Resurgence Powered by DesignXpress
- DesignXpress Merchandising OPC

## Core stack
- Next.js
- TypeScript
- Prisma
- SQLite for local/dev unless the repo is explicitly configured otherwise

## Main roles
- member
- coach
- partner
- sponsor
- admin

Preserve role boundaries at all times.

## Main system areas
- authentication and session handling
- homepage and gallery/media sections
- creator profiles with bio, stats, and journey/history
- products and services management
- product catalog and detail pages
- cart and checkout
- quotations and inquiries
- sponsorship and partnership workflows
- order and inventory management
- admin dashboard and reporting

## Working rules
- Inspect the existing code before editing.
- Prefer small, complete, production-safe changes over large rewrites.
- Reuse existing components, hooks, services, validators, and utilities before creating new ones.
- Follow the current folder structure, naming, and coding patterns.
- Keep frontend, backend, and Prisma logic aligned.
- Do not invent business logic, package inclusions, prices, stock counts, order states, sponsorship terms, or approval behavior.
- Do not hardcode secrets, tokens, API keys, credentials, or environment-specific URLs.
- Preserve working architecture unless there is a clear correctness, security, or maintainability reason to improve it.

## High-risk areas
Treat these as sensitive and regression-prone:
- auth and permissions
- middleware and protected routes
- pricing and quotation logic
- cart and checkout totals
- order creation and status changes
- inventory / stock deduction and updates
- payment states and webhook handling
- admin actions
- Prisma schema changes
- public inquiry and contact workflows

## Business behavior rules
- Keep the product premium, energetic, professional, basketball-focused, and brand-safe.
- For customer-facing support flows: answer the user’s question first when possible.
- Ask for lead/contact details only after clear business intent such as quotation, sponsorship inquiry, partnership request, or serious purchase intent.
- Do not promise unavailable features, unconfirmed pricing, timelines, stock, or approvals.
- If information is uncertain, state that a human team member must confirm it.

## Next.js rules
- Respect the router style already used in the repo.
- Do not mix App Router and Pages Router patterns carelessly.
- Keep server/client boundaries correct.
- Use server actions, route handlers, middleware, and client components intentionally.
- Avoid unnecessary client-side state when server-side handling is safer or simpler.
- Do not break layouts, metadata, navigation, protected pages, or middleware behavior.
- Be careful with caching, revalidation, and dynamic rendering.

## Prisma and data rules
- Inspect prisma/schema.prisma before changing models, relations, enums, or queries.
- Keep schema changes minimal and safe.
- If a schema change is required, inspect affected:
  - forms
  - validators
  - queries
  - route handlers
  - admin screens
  - seed logic
  - status transitions
- Protect data integrity for:
  - users and roles
  - creators and media
  - products and services
  - cart and orders
  - quotations and inquiries
  - payments and stock

## Security rules
- Assume all input is untrusted.
- Validate and sanitize user input.
- Enforce authentication and authorization on sensitive actions.
- Avoid exposing internal errors or protected data.
- Be careful with:
  - admin mutations
  - uploads
  - payment/webhook handlers
  - public forms
  - route protection
- Flag security or permission issues clearly.

## Debugging rules
- Find root cause before fixing.
- Do not patch symptoms only.
- Trace issues through:
  - page/component
  - form/action
  - API/route handler/service
  - Prisma query/model
  - resulting UI/data state

## Review priorities
Prioritize:
1. correctness
2. authorization/security
3. data integrity
4. maintainability
5. regression risk
6. performance

## Preferred commands
Use the repo’s actual scripts when present. Prefer these common commands when available:

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
npm test
npx prisma generate
npx prisma validate