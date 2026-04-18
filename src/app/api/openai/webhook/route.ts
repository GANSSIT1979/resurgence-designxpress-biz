import { Role, UserStatus } from "@prisma/client";
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";
import { ok } from "@/lib/api-utils";
import { db } from "@/lib/db";
import { getSupportRouteStatus } from "@/lib/openai-support";

export const runtime = "nodejs";

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;

  return new OpenAI({
    apiKey,
    webhookSecret: process.env.OPENAI_WEBHOOK_SECRET?.trim() || undefined,
  });
}

async function notifyAdmins(title: string, message: string) {
  const admins = await db.user.findMany({
    where: {
      role: Role.SYSTEM_ADMIN,
      status: UserStatus.ACTIVE,
    },
    select: { id: true },
  });

  if (!admins.length) return;

  await db.notification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      title,
      message,
    })),
  });
}

export async function GET() {
  const status = getSupportRouteStatus();

  return ok({
    ready: status.webhookReady,
    webhookRoute: "/api/openai/webhook",
    ...status,
  });
}

export async function POST(request: NextRequest) {
  const status = getSupportRouteStatus();

  if (!status.webhookReady) {
    return NextResponse.json(
      {
        ok: false,
        error: "OPENAI webhook verification is not configured.",
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

  const rawBody = await request.text();

  try {
    const event = await client.webhooks.unwrap(
      rawBody,
      request.headers,
      process.env.OPENAI_WEBHOOK_SECRET?.trim(),
    );

    if (event.type === "response.failed") {
      await notifyAdmins(
        "OpenAI support response failed",
        `OpenAI reported a failed response for ${event.data.id}.`,
      );
    }

    if (event.type === "response.incomplete") {
      await notifyAdmins(
        "OpenAI support response incomplete",
        `OpenAI reported an incomplete response for ${event.data.id}.`,
      );
    }

    console.log("Verified OpenAI webhook event:", event.type, event.id);

    return ok({
      received: true,
      verified: true,
      eventId: event.id,
      eventType: event.type,
    });
  } catch (error) {
    console.error("Invalid OpenAI webhook signature:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Invalid webhook signature.",
      },
      { status: 400 },
    );
  }
}
