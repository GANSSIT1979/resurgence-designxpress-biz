import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureChatConversation } from "@/lib/chat";
import { fail, ok } from "@/lib/api-utils";
import {
  buildSupportWorkflowStateVariables,
  getSupportCategory,
  getSupportRouteStatus,
  supportVerificationScenarios,
} from "@/lib/openai-support";
import { getPublicSettings } from "@/lib/settings";

export const runtime = "nodejs";

function getConversationIdFromRequest(request: NextRequest, body?: Record<string, unknown>) {
  const bodyValue = body?.conversationId;
  if (typeof bodyValue === "string" && bodyValue.trim()) return bodyValue.trim();

  const queryValue = request.nextUrl.searchParams.get("conversationId");
  if (queryValue) return queryValue.trim();

  return crypto.randomUUID();
}

function getUserIdFromRequest(request: NextRequest, body?: Record<string, unknown>) {
  const bodyValue = body?.userId;
  if (typeof bodyValue === "string" && bodyValue.trim()) return bodyValue.trim();

  const queryValue = request.nextUrl.searchParams.get("userId");
  if (queryValue) return queryValue.trim();

  return "";
}

function shouldCreateChatKitSession(request: NextRequest, body?: Record<string, unknown>) {
  const queryMode = request.nextUrl.searchParams.get("mode");
  const bodyMode = typeof body?.mode === "string" ? body.mode : "";

  if (queryMode === "chatkit" || bodyMode === "chatkit") return true;

  return Boolean(getUserIdFromRequest(request, body) && !body?.conversationId);
}

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  return new OpenAI({
    apiKey,
    webhookSecret: process.env.OPENAI_WEBHOOK_SECRET?.trim() || undefined,
  });
}

async function serializeConversationSession(conversationId: string) {
  const conversation = await ensureChatConversation(conversationId);
  const messages = await db.chatMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
    take: 50,
    select: {
      id: true,
      role: true,
      content: true,
      createdAt: true,
    },
  });

  const routeKey = conversation.lastIntent || "general";
  const route = getSupportCategory(routeKey);

  return {
    conversationId,
    leadCaptured: conversation.leadCaptured,
    routeKey: route.key,
    routeLabel: route.label,
    lead: {
      visitorName: conversation.visitorName,
      organization: conversation.organization,
      email: conversation.email,
      mobile: conversation.mobile,
      summary: conversation.summary,
    },
    messages,
  };
}

async function createChatKitSession(userId: string) {
  const status = getSupportRouteStatus();
  if (!status.chatkitReady) {
    return NextResponse.json(
      {
        ok: false,
        error: "OpenAI ChatKit is not configured yet.",
        ...status,
      },
      { status: 503 },
    );
  }

  const client = getOpenAIClient();
  if (!client) {
    return NextResponse.json(
      {
        ok: false,
        error: "OPENAI_API_KEY is not set.",
        ...status,
      },
      { status: 503 },
    );
  }

  try {
    const settings = await getPublicSettings();
    const session = await client.beta.chatkit.sessions.create({
      user: userId,
      workflow: {
        id: process.env.OPENAI_WORKFLOW_ID!.trim(),
        version: process.env.OPENAI_WORKFLOW_VERSION?.trim() || undefined,
        state_variables: buildSupportWorkflowStateVariables(settings),
        tracing: { enabled: true },
      },
      chatkit_configuration: {
        automatic_thread_titling: { enabled: true },
        file_upload: { enabled: false },
        history: {
          enabled: true,
          recent_threads: 10,
        },
      },
      expires_after: {
        anchor: "created_at",
        seconds: 60 * 10,
      },
      rate_limits: {
        max_requests_per_1_minute: 30,
      },
    });

    return ok({
      sessionMode: "chatkit",
      userId,
      client_secret: session.client_secret,
      sessionId: session.id,
      expiresAt: session.expires_at,
      workflowConfigured: true,
      workflowVersionPinned: Boolean(process.env.OPENAI_WORKFLOW_VERSION?.trim()),
      supportedRoutes: supportVerificationScenarios.map((category) => ({
        key: category.key,
        label: category.label,
        description: category.description,
      })),
    });
  } catch (error) {
    console.error("Unable to create OpenAI ChatKit session:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Unable to create the OpenAI ChatKit session.",
      },
      { status: 502 },
    );
  }
}

export async function GET(request: NextRequest) {
  const conversationId = request.nextUrl.searchParams.get("conversationId");
  const status = getSupportRouteStatus();

  const response = {
    sessionMode: "readiness",
    ...status,
    supportedRoutes: supportVerificationScenarios.map((category) => ({
      key: category.key,
      label: category.label,
      description: category.description,
    })),
    verificationRoutes: ["/support", "/api/chatkit/session", "/api/openai/webhook"],
  };

  if (!conversationId) {
    return ok(response);
  }

  return ok({
    ...response,
    ...(await serializeConversationSession(conversationId)),
  });
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  if (shouldCreateChatKitSession(request, body)) {
    const userId = getUserIdFromRequest(request, body);
    if (!userId) return fail("Missing userId", 400);
    return createChatKitSession(userId);
  }

  const conversationId = getConversationIdFromRequest(request, body);
  if (!conversationId) return fail("Missing conversationId", 400);

  return ok({
    sessionMode: "conversation",
    ...getSupportRouteStatus(),
    ...(await serializeConversationSession(conversationId)),
  });
}
