# AI Support Patch Notes

Updated: 2026-04-16

## Purpose

This note tracks the AI customer service implementation layer for the active `src/` application.

## Current State

- `/support` is the public support entry point
- `/api/chatkit/session` now exposes readiness and ChatKit session behavior
- `/api/chatkit/message` classifies sponsorships, events, custom apparel, and partnerships
- `/api/openai/webhook` verifies signed OpenAI webhook payloads
- `npm run support:verify` is the current verification command

## Outstanding External Steps

- publish the OpenAI workflow
- set `OPENAI_WORKFLOW_ID`
- create the OpenAI project webhook
- set `OPENAI_WEBHOOK_SECRET`

## Canonical Docs

- `README.md`
- `docs/API.md`
- `docs/AI_SUPPORT_PRODUCTION.md`
- `docs/TROUBLESHOOTING.md`
