# Runtime Fix Pack

Replace:

- `src/lib/auth.ts`
- `src/lib/ai/resurgence-agent.ts`

Fixes included:
- adds `getApiUser`
- adds `hashPassword`
- keeps sponsorId available on auth user objects
- removes unsupported `reasoning.effort` model parameter from the Agents SDK config
- returns cleaner runtime errors from the AI route

After replacing files:

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```
