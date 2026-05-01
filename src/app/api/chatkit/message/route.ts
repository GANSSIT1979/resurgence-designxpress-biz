import { Prisma } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import {
  generateSupportResponse,
  getSupportCategory,
  getSupportRouteStatus,
  inferSupportCategory,
} from "@/lib/openai-support";
import { getPublicSettings, type PublicSettings } from "@/lib/settings";
import { COOKIE_NAME, verifySession } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

type PersistedMessageRow = {
  id: string;
  conversationId: string;
  userId: string;
  role: "user" | "assistant" | "system" | string;
  content: string;
  createdAt: Date | string;
};

type UiMessage = {
  id: string;
  role: "user" | "assistant" | string;
  content: string;
  createdAt: string;
  routeLabel?: string;
};

type Actor = {
  session: {
    email: string;
    role: string;
    displayName?: string;
  };
  authUserId: string;
  email: string;
  role: string;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function hasBusinessIntent(message: string) {
  return /(proposal|quotation|quote|pricing|price|budget|meeting|callback|call me|formal follow-up|proceed|interested in partnering|order number|payment reference|delivery issue|urgent)/i.test(
    message
  );
}

function buildSupportReply(message: string, routeKey: string, settings: PublicSettings) {
  const lower = message.toLowerCase();
  const askForLeadDetails = hasBusinessIntent(message);
  const primaryContactLine = `${settings.contactEmail} / ${settings.contactPhone}`;
  const supportContactLine = `${settings.supportEmail} / ${settings.supportPhone}`;

  if (routeKey === "orders") {
    return askForLeadDetails
      ? `We can help route order, product availability, checkout, and shipping concerns for ${settings.brandName}.\n\nPlease share your full name, email address, mobile number, order number if available, product name, and the delivery or checkout concern. Our support team can follow up through ${supportContactLine} during ${settings.businessHours}.\n\nShipping coverage: ${settings.shippingArea}.`
      : `For order and shipping support, please tell us whether this is about product availability, checkout, an existing order, or delivery.\n\nIf you already placed an order, include the order number if available, the customer email used at checkout, and the product name. Shipping coverage is ${settings.shippingArea}.`;
  }

  if (routeKey === "payments") {
    return askForLeadDetails
      ? `${settings.brandName} accepts these configured payment methods: ${settings.paymentMethods}.\n\nFor payment confirmation, please share your full name, email address, mobile number, order or invoice reference if available, payment method, amount, payment date, and reference number. Do not send card numbers or sensitive financial credentials here.\n\nSupport contact: ${supportContactLine}.`
      : `Configured payment methods are: ${settings.paymentMethods}. Currency is ${settings.currency}.\n\nFor payment help, tell us if you need available methods, payment confirmation, receipt support, billing reference help, or refund routing. Please do not share card numbers or sensitive account credentials.`;
  }

  if (routeKey === "events") {
    return askForLeadDetails
      ? `We can help with event booking, league support, and on-ground activation planning.\n\nPlease share your full name, organization, email address, mobile number, and the event date, venue, and audience size so our team can route this for formal follow-up.\n\nYou can also leave the details in the form on this page or contact ${supportContactLine} during ${settings.businessHours}.`
      : `We support basketball events, leagues, activations, and venue-side coordination.\n\nThe fastest next step is to share the event type, date, venue, target audience, and the kind of support you need so we can point you to the right workflow.`;
  }

  if (routeKey === "custom-apparel") {
    return askForLeadDetails
      ? `We can route custom jersey, uniform, and apparel requests.\n\nPlease send your full name, organization, email address, mobile number, item type, required quantity, sizing range, target timeline, and any design or branding notes so our team can follow up with accurate production details.\n\nYou can also submit those details through the support form on this page or contact ${supportContactLine}.`
      : `We can help with custom jerseys, uniforms, and apparel production requests.\n\nTo prepare an accurate handoff, we usually need item type, quantity, sizing range, target timeline, logo/design files, and preferred payment or delivery arrangement.`;
  }

  if (routeKey === "partnerships") {
    return askForLeadDetails
      ? `${settings.brandName} is open to media, brand, and creator collaboration discussions.\n\nPlease share your full name, organization, email address, mobile number, and a short summary of the partnership you want to explore so ${settings.contactName} (${settings.contactRole}) can route this for review.\n\nDirect contact: ${primaryContactLine}.`
      : `We handle media partnerships, brand collaborations, and creator-led opportunities.\n\nA useful next step is to tell us whether you're looking for media support, co-branding, creator collaboration, or a longer-term commercial partnership.`;
  }

  if (lower.includes("price") || lower.includes("cost") || lower.includes("rate")) {
    return `Package and commercial pricing depend on scope, inventory, and activation requirements.\n\nIf you want a formal estimate, please share your full name, organization, email address, mobile number, and what you need help with so ${settings.contactName} can route it for follow-up. Direct contact: ${primaryContactLine}.`;
  }

  return askForLeadDetails
    ? `We can help with sponsorship packages, creator integrations, and brand activation planning.\n\nPlease share your full name, organization, email address, mobile number, campaign goal, target timeline, and the exact sponsorship support you need so ${settings.contactName} (${settings.contactRole}) can route this for formal follow-up.\n\nYou can also leave the details in the support form on this page or contact ${primaryContactLine}.`
    : `We can help with sponsorship packages, creator-led integrations, activations, and general support questions.\n\nIf you're exploring a serious sponsorship conversation, the fastest path is to tell us your brand, campaign goals, target timeline, and preferred package direction so we can prepare the right follow-up.`;
}

function parseHistory(value: unknown): ConversationMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .flatMap((item) => {
      if (!item || typeof item !== "object") return [];

      const role = item.role === "user" || item.role === "assistant" ? item.role : null;
      const content = typeof item.content === "string" ? item.content.trim() : "";

      if (!role || !content) return [];
      return [{ role, content }];
    })
    .slice(-10);
}

function toUiMessage(row: PersistedMessageRow, routeLabel?: string): UiMessage {
  return {
    id: row.id,
    role: row.role,
    content: row.content,
    createdAt:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : new Date(row.createdAt).toISOString(),
    ...(routeLabel ? { routeLabel } : {}),
  };
}

async function resolveActor(request: NextRequest): Promise<Actor | null> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const session = await verifySession(token);

  if (!session) return null;

  const rows = await db.$queryRaw<Array<{ id: string; email: string | null }>>(Prisma.sql`
    select id::text as id, email
    from auth.users
    where email = ${session.email}
    limit 1
  `);

  const authUser = rows[0];
  if (!authUser?.id) return null;

  return {
    session,
    authUserId: authUser.id,
    email: authUser.email || session.email,
    role: session.role,
  };
}

async function getConversationAccess(
  tx: Prisma.TransactionClient,
  args: { conversationId: string; authUserId: string }
) {
  const rows = await tx.$queryRaw<
    Array<{
      exists: boolean;
      isParticipant: boolean;
    }>
  >(Prisma.sql`
    select
      exists (
        select 1
        from public.conversations c
        where c.id = ${args.conversationId}::uuid
      ) as "exists",
      exists (
        select 1
        from public.conversation_participants cp
        where cp.conversation_id = ${args.conversationId}::uuid
          and cp.user_id = ${args.authUserId}::uuid
      ) as "isParticipant"
  `);

  return rows[0] || { exists: false, isParticipant: false };
}

async function createConversationIfMissing(
  tx: Prisma.TransactionClient,
  args: { conversationId: string; authUserId: string }
) {
  await tx.$executeRaw(Prisma.sql`
    insert into public.conversations (id, user_id)
    values (${args.conversationId}::uuid, ${args.authUserId}::uuid)
    on conflict (id) do nothing
  `);

  await tx.$executeRaw(Prisma.sql`
    insert into public.conversation_participants (conversation_id, user_id)
    values (${args.conversationId}::uuid, ${args.authUserId}::uuid)
    on conflict (conversation_id, user_id) do nothing
  `);
}

async function insertMessage(
  tx: Prisma.TransactionClient,
  args: {
    conversationId: string;
    authUserId: string;
    role: "user" | "assistant" | "system";
    content: string;
  }
) {
  const rows = await tx.$queryRaw<PersistedMessageRow[]>(Prisma.sql`
    insert into public.messages (
      conversation_id,
      user_id,
      role,
      content
    )
    values (
      ${args.conversationId}::uuid,
      ${args.authUserId}::uuid,
      ${args.role},
      ${args.content}
    )
    returning
      id::text as id,
      conversation_id::text as "conversationId",
      user_id::text as "userId",
      role,
      content,
      created_at as "createdAt"
  `);

  const row = rows[0];
  if (!row) {
    throw new Error("Insert into public.messages returned no row.");
  }

  return row;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const requestedConversationId = String(body?.conversationId || "").trim();
    const message = String(body?.message || "").trim();
    const history = parseHistory(body?.history);

    if (!message) {
      return NextResponse.json(
        { ok: false, error: "Missing message." },
        { status: 400 }
      );
    }

    const actor = await resolveActor(req);
    if (!actor) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unauthorized. A valid app session mapped to auth.users is required.",
        },
        { status: 401 }
      );
    }

    const conversationId = isUuid(requestedConversationId)
      ? requestedConversationId
      : randomUUID();

    const routeKey = inferSupportCategory(message);
    const route = getSupportCategory(routeKey);
    const settings = await getPublicSettings();
    const supportStatus = getSupportRouteStatus();

    let aiEnabled = false;
    let output: string | null = null;

    if (supportStatus.chatkitReady) {
      try {
        output = await generateSupportResponse({
          conversationId,
          history,
          message,
          route,
          settings,
        });
        aiEnabled = Boolean(output);
      } catch (error) {
        console.error("OpenAI support reply failed, falling back to local routing:", error);
      }
    }

    if (!output) {
      output = buildSupportReply(message, route.key, settings);
    }

    const result = await db.$transaction(async (tx) => {
      const access = await getConversationAccess(tx, {
        conversationId,
        authUserId: actor.authUserId,
      });

      if (!access.exists) {
        await createConversationIfMissing(tx, {
          conversationId,
          authUserId: actor.authUserId,
        });
      } else if (!access.isParticipant) {
        throw new Error("FORBIDDEN_CONVERSATION_ACCESS");
      }

      const userMessage = await insertMessage(tx, {
        conversationId,
        authUserId: actor.authUserId,
        role: "user",
        content: message,
      });

      const assistantMessage = await insertMessage(tx, {
        conversationId,
        authUserId: actor.authUserId,
        role: "assistant",
        content: output as string,
      });

      return { userMessage, assistantMessage };
    });

    return NextResponse.json({
      ok: true,
      aiEnabled,
      conversationId,
      output,
      userMessage: toUiMessage(result.userMessage),
      assistantMessage: toUiMessage(result.assistantMessage, route.label),
      requiresLeadDetails: hasBusinessIntent(message),
      leadCaptured: false,
      routeKey: route.key,
      routeLabel: route.label,
      routeSummary: route.summary,
      supportMode: aiEnabled ? "ai" : "local-fallback",
      actor: {
        email: actor.email,
        role: actor.role,
        authUserId: actor.authUserId,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN_CONVERSATION_ACCESS") {
      return NextResponse.json(
        { ok: false, error: "Forbidden." },
        { status: 403 }
      );
    }

    console.error("Chatkit message route error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unable to process support message right now.",
      },
      { status: 500 }
    );
  }
}
