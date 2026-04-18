# AI Support Patch Notes

This document reflects the **current AI integration state** after the dependency and build hardening work.

## Current status

AI support is now treated as **optional**, not mandatory.

That means:
- the base app should build and run **without** the OpenAI Agents SDK
- `/support` can still exist in the app
- AI-related routes should fail gracefully when AI-only dependencies are not installed
- the rest of the site must continue working normally even when AI is disabled

## What this patch family was intended to add

- persistent RESURGENCE support desk behavior
- conversation memory via `conversationId`
- lead capture tracking with `leadCaptured`
- chat-related Prisma records
- support-related API routes
- a support chat widget on `/support`

## What changed in the hardened setup

Earlier patch notes assumed AI packages were part of the required base install.  
That is **no longer the current baseline**.

### Current baseline
- `openai` may exist in the project
- `@openai/agents` is **not required** for the base install
- the project must still install, build, and run without AI-specific packages
- AI enablement is a separate controlled step

## Expected behavior right now

### Without AI-only packages
- `npm install` should succeed
- Prisma setup should succeed
- the website and dashboards should work
- `/support` may load in a limited or placeholder mode
- AI message routes should return a safe failure or disabled-state response instead of breaking the app build

### With AI enabled later
You should:
1. install the required AI-only packages intentionally
2. confirm dependency compatibility
3. set `OPENAI_API_KEY`
4. test `/support` and related APIs in staging

## Current environment expectation

Base app:

```env
OPENAI_API_KEY=""
OPENAI_WORKFLOW_ID=""
OPENAI_WEBHOOK_SECRET=""
```

If AI is enabled later:

```env
OPENAI_API_KEY="your-api-key"
```

## Recommended local validation

### Base non-AI validation
1. Run `npm install`
2. Run `npm run prisma:generate`
3. Run `npm run db:push`
4. Run `npm run db:seed`
5. Run `npm run dev`
6. Open `/support`
7. Confirm the app still runs even if live AI is not active

### Future AI validation
1. Install the required AI-only dependencies
2. Add `OPENAI_API_KEY`
3. Open `/support`
4. Ask a general question
5. Ask for a proposal or sponsorship details
6. Confirm the business-intent path behaves correctly
7. Confirm lead capture does not repeatedly ask for the same details after they are stored

## Implementation direction to preserve

When AI is fully enabled later, keep these product rules:

- answer the visitor’s question first
- ask for lead details only when business intent is clear
- persist a stable `conversationId`
- persist `leadCaptured`
- do not re-ask for full business details once already captured
- degrade gracefully when AI services are unavailable

## Important project note

These notes now align with the current project direction:
- **stable base build first**
- **optional AI second**
- no required AI dependency should block website setup, Prisma setup, or dashboard access
