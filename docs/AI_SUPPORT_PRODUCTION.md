# AI Customer Service Production Checklist

Updated: 2026-04-16

## Goal

Bring the RESURGENCE AI customer service flow from repository wiring to a fully published OpenAI workflow with verified production routes.

## Required Routes

- `/support`
- `/api/chatkit/session`
- `/api/openai/webhook`

## OpenAI Project Steps

1. Publish the RESURGENCE support workflow in OpenAI Agent Builder
2. Save the published workflow ID to `OPENAI_WORKFLOW_ID`
3. Optionally pin the deployed version in `OPENAI_WORKFLOW_VERSION`
4. Create an OpenAI project webhook that points to:

```text
https://your-domain.example/api/openai/webhook
```

5. Save the webhook signing secret to `OPENAI_WEBHOOK_SECRET`

## Required Environment Variables

```env
OPENAI_API_KEY="sk-..."
OPENAI_WORKFLOW_ID="wf_..."
OPENAI_WORKFLOW_VERSION=""
OPENAI_WEBHOOK_SECRET="whsec_..."
OPENAI_DEFAULT_MODEL="gpt-4.1-mini"
NEXT_PUBLIC_SITE_URL="https://your-domain.example"
```

## Support Coverage

The support flow is currently designed to classify and respond to:

- sponsorships
- events
- custom apparel
- partnerships

## Verification Command

Run after deployment:

```bash
npm run support:verify -- --base-url=https://your-domain.example --webhook-secret=whsec_...
```

## What The Verifier Checks

- the `/support` page responds
- `/api/chatkit/session` readiness data responds
- conversation bootstrap through `/api/chatkit/session` works
- ChatKit session creation through `/api/chatkit/session` works when OpenAI config is present
- route classification works for sponsorships, events, custom apparel, and partnerships
- `/api/openai/webhook` accepts a correctly signed OpenAI-style webhook payload

## Current Caveats

- The repository wiring is in place, but workflow publishing and webhook creation still require OpenAI project dashboard access.
- Full repository build cleanup is still needed before a real production deployment should be considered complete.
