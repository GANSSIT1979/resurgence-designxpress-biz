# AI Support Desk Patch Notes

This patch adds a persistent RESURGENCE support desk with conversation memory and lead capture.

## Added
- Prisma models: `ChatConversation`, `ChatMessage`
- Custom Agents SDK session backed by Prisma
- OpenAI agent runner with lead-aware instructions
- APIs:
  - `/api/chatkit/session`
  - `/api/chatkit/message`
  - `/api/chatkit/lead`
- Client widget: `components/support-chat-widget.tsx`

## Updated
- `/support` page now renders the live support desk
- `/api/health` now reports `aiConfigured`
- `README.md` now includes AI support desk setup notes
- `package.json` now includes `@openai/agents`
- Prisma seed reset clears chat tables

## Required local steps
```bash
npm install
npm run prisma:generate
npm run db:push
npm run db:seed
npm run dev
```

## Required environment variable
```env
OPENAI_API_KEY="your-api-key"
```

## Test flow
1. Open `/support`
2. Ask a general question
3. Ask for a proposal or sponsorship details
4. Confirm the lead form opens
5. Submit business details
6. Ask another business follow-up question
7. Confirm the assistant does not ask for full details again
