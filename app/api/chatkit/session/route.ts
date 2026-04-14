import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ensureChatConversation } from "@/lib/chat";
import { fail, ok } from "@/lib/api-utils";

function getConversationIdFromRequest(request: NextRequest, body?: Record<string, unknown>) {
  const bodyValue = body?.conversationId;
  if (typeof bodyValue === "string" && bodyValue.trim()) return bodyValue.trim();

  const queryValue = request.nextUrl.searchParams.get("conversationId");
  if (queryValue) return queryValue.trim();

  return crypto.randomUUID();
}

async function serializeSession(conversationId: string) {
  const conversation = await ensureChatConversation(conversationId);
  const messages = await db.chatMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    take: 50,
    select: {
      id: true,
      role: true,
      content: true,
      createdAt: true
    }
  });

  return {
    conversationId,
    leadCaptured: conversation.leadCaptured,
    lead: {
      visitorName: conversation.visitorName,
      organization: conversation.organization,
      email: conversation.email,
      mobile: conversation.mobile,
      summary: conversation.summary
    },
    messages
  };
}

export async function GET(request: NextRequest) {
  const conversationId = getConversationIdFromRequest(request);
  return ok(await serializeSession(conversationId));
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const conversationId = getConversationIdFromRequest(request, body);
  if (!conversationId) return fail("Missing conversationId", 400);
  return ok(await serializeSession(conversationId));
}
