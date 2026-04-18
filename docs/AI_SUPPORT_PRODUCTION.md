# AI Customer Service Production Checklist

Updated: 2026-04-19

## Current Support Reality

The support desk already works locally without a published OpenAI workflow.

Today the stack includes:

- `/support` for the public support experience
- `/api/chatkit/session` for widget bootstrap and local ChatKit-style session payloads
- `/api/chatkit/message` for rule-based routing across support categories
- `/api/chatkit/lead` for inquiry creation and workflow automation
- `/api/openai/webhook` for signed webhook verification

## Supported Categories

- sponsorships
- events
- custom apparel
- partnerships

## What Still Requires OpenAI Project Setup

If you want a fully configured workflow-backed production setup, you still need to:

1. set `OPENAI_API_KEY`
2. publish the support workflow and save its ID to `OPENAI_WORKFLOW_ID`
3. optionally pin a version with `OPENAI_WORKFLOW_VERSION`
4. create an OpenAI project webhook that targets `https://your-domain.example/api/openai/webhook`
5. save the signing secret to `OPENAI_WEBHOOK_SECRET`

## Relevant Environment Variables

```env
OPENAI_API_KEY="sk-..."
OPENAI_WORKFLOW_ID="wf_..."
OPENAI_WORKFLOW_VERSION=""
OPENAI_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_SITE_URL="https://your-domain.example"
```

## Verification

Local verification:

```bash
npm run support:verify -- --base-url=http://localhost:3000
```

Production verification:

```bash
npm run support:verify -- --base-url=https://your-domain.example --webhook-secret=whsec_...
```

The verifier now auto-loads `.env` when run locally, but the target app must already be running.

## What The Verifier Checks

- the `/support` page responds
- `/api/chatkit/session` readiness data responds
- conversation bootstrap works
- local ChatKit-style session creation works
- route classification works for all four support categories
- `/api/openai/webhook` accepts a correctly signed payload when the secret is available

## Operational Notes

- `GET /api/health` is the easiest way to inspect support readiness from the app side
- `POST /api/chatkit/lead` creates an `Inquiry` plus notification and automated email records
- if `EMAIL_WEBHOOK_URL` is not configured, outbound email records are marked `SKIPPED`
