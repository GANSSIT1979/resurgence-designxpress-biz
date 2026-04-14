import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ensureChatConversation } from "@/lib/chat";
import { fail, ok } from "@/lib/api-utils";

const schema = z.object({
  conversationId: z.string().min(1),
  message: z.string().min(1).max(4000)
});

export async function POST(request: NextRequest) {
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

  let runSupportAgent: ((input: {
    conversationId: string;
    message: string;
    context: {
      leadCaptured: boolean;
      visitorName?: string | null;
      organization?: string | null;
      email?: string | null;
      mobile?: string | null;
    };
  }) => Promise<string>) | null = null;

  try {
    const mod = await import("@/lib/ai/resurgence-agent");
    runSupportAgent = mod.runSupportAgent;
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown error";
    return fail(
      `AI support is disabled because the OpenAI Agents SDK is not installed or failed to load. Install @openai/agents and zod, then restart the app. Detail: ${detail}`,
      503
    );
  }

  let output: string;
  try {
    output = await runSupportAgent({
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
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown error";
    return fail(`AI support is unavailable right now. ${detail}`, 503);
  }

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
