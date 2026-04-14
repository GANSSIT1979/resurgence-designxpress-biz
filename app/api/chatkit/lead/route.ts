import { NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { ensureChatConversation, getAdminRoutingEmail } from "@/lib/chat";
import { fail, ok } from "@/lib/api-utils";

const schema = z.object({
  conversationId: z.string().min(1),
  fullName: z.string().min(2).max(120),
  organization: z.string().max(160).optional().or(z.literal("")),
  email: z.string().email(),
  mobile: z.string().min(7).max(40),
  summary: z.string().min(5).max(2000)
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid JSON body", 400);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message || "Invalid lead payload", 400);
  }

  const { conversationId, fullName, organization, email, mobile, summary } = parsed.data;
  const existing = await ensureChatConversation(conversationId);

  const updatedConversation = await db.chatConversation.update({
    where: { conversationId },
    data: {
      visitorName: fullName,
      organization: organization || null,
      email,
      mobile,
      summary,
      leadCaptured: true,
      leadCapturedAt: existing.leadCaptured ? existing.leadCapturedAt : new Date(),
      lastIntent: "business_inquiry"
    }
  });

  if (!existing.leadCaptured) {
    const routingEmail = await getAdminRoutingEmail();

    await db.inquiry.create({
      data: {
        name: fullName,
        email,
        phone: mobile,
        company: organization || null,
        subject: "AI Support Lead Capture",
        message: summary
      }
    });

    await db.emailQueue.create({
      data: {
        toEmail: routingEmail,
        subject: `New RESURGENCE AI lead: ${fullName}`,
        template: "ai-support-lead",
        payload: {
          conversationId,
          fullName,
          organization: organization || null,
          email,
          mobile,
          summary
        }
      }
    });

    const admins = await db.user.findMany({
      where: { role: "SYSTEM_ADMIN", status: "ACTIVE" },
      select: { id: true }
    });

    if (admins.length) {
      await db.notification.createMany({
        data: admins.map((admin) => ({
          userId: admin.id,
          title: "New AI Support Lead",
          message: `${fullName} submitted business details from the RESURGENCE support desk.`
        }))
      });
    }
  }

  return ok({
    ok: true,
    leadCaptured: true,
    conversationId,
    lead: {
      visitorName: updatedConversation.visitorName,
      organization: updatedConversation.organization,
      email: updatedConversation.email,
      mobile: updatedConversation.mobile,
      summary: updatedConversation.summary
    }
  });
}
