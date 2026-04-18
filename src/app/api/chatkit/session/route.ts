<<<<<<< HEAD
import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
=======
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { ensureChatConversation } from "@/lib/chat";
import { fail, ok } from "@/lib/api-utils";
>>>>>>> parent of d975526 (commit)

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  const workflowId = process.env.OPENAI_WORKFLOW_ID;

<<<<<<< HEAD
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'Missing OPENAI_API_KEY.' }, { status: 500 });
  }

  if (!workflowId) {
    return NextResponse.json({ error: 'Missing OPENAI_WORKFLOW_ID.' }, { status: 500 });
  }

  const body = await request.json().catch(() => ({}));
  const userId = typeof body?.userId === 'string' && body.userId.trim() ? body.userId.trim() : crypto.randomUUID();

  try {
    const session = await client.beta.chatkit.sessions.create({
      workflow: { id: workflowId },
      user: userId,
    });

    return NextResponse.json({
      client_secret: session.client_secret,
      expires_at: session.expires_at,
      userId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create ChatKit session.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
=======
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
>>>>>>> parent of d975526 (commit)
}
