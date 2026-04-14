import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ensureChatConversation } from "@/lib/chat";
import { fail, ok } from "@/lib/api-utils";
import { runSupportAgent } from "@/lib/ai/resurgence-agent";

const schema = z.object({
  conversationId: z.string().min(1),
  message: z.string().min(1).max(4000)
});

export async function POST(request: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return fail("AI support is not configured yet. Add OPENAI_API_KEY in your environment.", 503);
  }

  let parsedBody: unknown;
  try {
    parsedBody = await request.json();
  } catch {
    return fail("Invalid JSON body", 400);
  }

  const parsed = schema.safeParse(parsedBody);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid request", 400);
  }

  const { conversationId, message } = parsed.data;
  const conversation = await ensureChatConversation(conversationId);

  const output = await runSupportAgent({
    conversationId,
    message,
    context: {
      leadCaptured: conversation.leadCaptured,
      visitorName: conversation.visitorName,
      organization: conversation.organization,
      email: conversation.email,
      mobile: conversation.mobile
    }
  });

  const refreshed = await db.chatConversation.findUnique({
    where: { conversationId },
    select: {
      leadCaptured: true,
      visitorName: true,
      organization: true,
      email: true,
      mobile: true,
      summary: true
    }
  });

  return ok({
    conversationId,
    output,
    leadCaptured: refreshed?.leadCaptured ?? false,
    lead: refreshed
  });
}
