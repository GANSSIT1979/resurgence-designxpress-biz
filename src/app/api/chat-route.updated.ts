import {
  OpenAIConversationsSession,
  startOpenAIConversationsSession,
  withTrace,
} from "@openai/agents";
import { NextResponse } from "next/server";
import {
  resurgenceCustomerService,
  resurgenceRunner,
} from "@/lib/resurgence-agent";

export const runtime = "nodejs";

type ChatRequestBody = {
  message?: string;
  conversationId?: string | null;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as ChatRequestBody | null;
    const message = body?.message?.trim();
    const incomingConversationId = body?.conversationId?.trim() || null;

    if (!message) {
      return NextResponse.json(
        { ok: false, error: "The 'message' field is required." },
        { status: 400 }
      );
    }

    const conversationId =
      incomingConversationId || (await startOpenAIConversationsSession());

    const session = new OpenAIConversationsSession({
      conversationId,
    });

    const result = await withTrace("Resurgence Website Chat", async () => {
      return resurgenceRunner.run(resurgenceCustomerService, message, {
        session,
        groupId: conversationId,
      });
    });

    const outputText =
      typeof result.finalOutput === "string"
        ? result.finalOutput.trim()
        : String(result.finalOutput ?? "").trim();

    if (!outputText) {
      return NextResponse.json(
        { ok: false, error: "The assistant returned an empty response." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: outputText,
      conversationId,
    });
  } catch (error) {
    console.error("Resurgence chat API error:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          "We could not process your request right now. Please try again shortly.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "resurgence-chat",
  });
}
