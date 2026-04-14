import { db } from "@/lib/db";

export async function ensureChatConversation(conversationId: string) {
  return db.chatConversation.upsert({
    where: { conversationId },
    update: {},
    create: { conversationId }
  });
}

export async function getAdminRoutingEmail() {
  const contactInfo = await db.setting.findUnique({ where: { key: "contactInformation" } });
  if (contactInfo && typeof contactInfo.value === "object" && contactInfo.value && "email" in (contactInfo.value as Record<string, unknown>)) {
    const email = (contactInfo.value as Record<string, unknown>).email;
    if (typeof email === "string" && email.trim()) return email;
  }

  const adminContact = await db.setting.findUnique({ where: { key: "adminContactData" } });
  if (adminContact && typeof adminContact.value === "string") {
    const match = adminContact.value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
    if (match) return match[0];
  }

  return "support@resurgence.designxpress.biz";
}
