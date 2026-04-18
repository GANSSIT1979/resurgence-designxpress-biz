# AI-Enabled Upgrade Patch

This patch converts the project from the current **stable optional-AI build** to an **AI-enabled build** for the RESURGENCE support desk.

## What this patch changes

- adds `@openai/agents`
- upgrades `zod` to v4
- removes the direct `openai` package from the base dependency tree to avoid the prior Zod conflict in this project
- replaces the optional runtime loader with a normal AI-enabled `lib/ai/resurgence-agent.ts`
- enables `app/api/chatkit/message/route.ts` to call the live agent directly

## Important

This patch is for a **separate AI-enabled pass**. It is not the same as the earlier stabilized non-AI build.

## Before you apply it

1. Make sure you are okay upgrading to Zod 4.
2. Use **Node 20.x**.
3. Keep a backup of your currently working non-AI `package.json`.

## Replace these files

- `package.json`
- `lib/ai/resurgence-agent.ts`
- `app/api/chatkit/message/route.ts`

## Required environment variable

Add this to `.env`:

```env
OPENAI_API_KEY="your-api-key"
```

Optional:

```env
OPENAI_DEFAULT_MODEL="gpt-4.1-mini"
```

## Clean install steps (Windows PowerShell)

```powershell
Remove-Item -Recurse -Force node_modules,.next -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm install
npm run prisma:generate
npm run db:push
npm run db:seed
npm run dev
```

## Verify

- `http://localhost:3000/support`
- ask a general question
- ask for a proposal
- confirm the assistant responds live instead of showing the disabled AI message
