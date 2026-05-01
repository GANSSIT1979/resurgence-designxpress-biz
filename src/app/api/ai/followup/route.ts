import { generateAiFollowUp } from '@/lib/automation/followups';

export async function POST(req: Request) {
  const context = await req.json();
  const message = await generateAiFollowUp(context);
  return Response.json({ ok: true, message });
}
