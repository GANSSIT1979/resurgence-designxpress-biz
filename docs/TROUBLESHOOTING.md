# TROUBLESHOOTING

## Prisma Client Not Initialized

Error:
- `@prisma/client did not initialize yet`

Fix:
```bash
npm run prisma:generate
```

Then restart the dev server.

## Wrong Prisma Delegate Name

Example error:
- `Cannot read properties of undefined (reading 'findMany')`

Cause:
- code uses a model delegate that does not exist in the generated client

Common example:
- wrong: `db.sponsorSubmission`
- correct: `db.sponsorApplication`

## Build Error: Cannot Resolve Alias

Error:
- `Module not found: Can't resolve '@/lib/db'`

Fix:
- ensure `tsconfig.json` maps `@/*` to `./src/*`
- or convert affected imports to relative paths
- keep project structure consistent under `src/`

## Optional AI Build Errors

Error:
- `Can't resolve '@openai/agents'`

Fix:
- either install the optional package stack and align Zod versions
- or keep the guarded optional-AI build path so the rest of the app runs without AI

## Unsupported AI Model Parameter

Error:
- `Unsupported parameter: reasoning.effort`

Fix:
- remove unsupported model parameters from the AI agent config
- keep the model configuration conservative unless confirmed supported

## Login Loop

Possible causes:
- stale cookies
- login route not setting cookie correctly
- middleware unable to verify cookie
- client-side redirect racing cookie availability

Fixes:
- clear localhost cookies
- use full navigation after login if needed
- verify auth helper compatibility with middleware runtime

## JSON Parse Error on res.json()

Error:
- `Unexpected end of JSON input`

Cause:
- API route returned empty or invalid JSON

Fix:
- always return JSON from routes expected by the client
- use safer client parsers for optional/empty responses

## CSS Suddenly Breaks Near Bottom of File

Cause:
- broken nested `@media` blocks
- missing closing braces

Fix:
- validate the bottom of `globals.css`
- prefer replacing with a known-good finalized version if needed

## Windows Install Issues

If `prisma` is not recognized:
```bash
npx prisma generate
```

If `tsx` is not recognized:
```bash
npx tsx prisma/seed.ts
```

If PowerShell blocks execution:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```
