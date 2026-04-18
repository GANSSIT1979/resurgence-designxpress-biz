import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { runResurgenceAgent } from "@/lib/ai/resurgence-agent";
import { getSupportCategory, inferSupportCategory } from "@/lib/openai-support";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const conversationId = String(body?.conversationId || "").trim();
    const message = String(body?.message || "").trim();

    if (!conversationId || !message) {
      return NextResponse.json(
        { ok: false, error: "Missing conversationId or message." },
        { status: 400 }
      );
    }

    let conversation = await db.chatConversation.findUnique({
      where: { conversationId },
    });

    if (!conversation) {
      conversation = await db.chatConversation.create({
        data: { conversationId },
      });
    }

    const routeKey = inferSupportCategory(message);
    const route = getSupportCategory(routeKey);

    await db.chatMessage.create({
      data: {
        conversationId,
        role: "user",
        content: message,
      },
    });

    const result = await runResurgenceAgent({
      conversationId,
      message,
      leadCaptured: conversation.leadCaptured,
      routeKey,
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          aiEnabled: false,
          error: result.error,
          routeKey: route.key,
          routeLabel: route.label,
        },
        { status: result.status }
      );
    }

    const updatedConversation = await db.chatConversation.update({
      where: { conversationId },
      data: {
        lastIntent: route.key,
      },
    });

    await db.chatMessage.create({
      data: {
        conversationId,
        role: "assistant",
        content: result.output,
      },
    });

    return NextResponse.json({
      ok: true,
      aiEnabled: true,
      output: result.output,
      leadCaptured: updatedConversation.leadCaptured,
      routeKey: route.key,
      routeLabel: route.label,
    });
  } catch (error) {
    console.error("Chatkit message route error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Unable to process support message right now.",
      },
      { status: 500 }
    );
  }
}
