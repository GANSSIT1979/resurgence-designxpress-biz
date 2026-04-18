import { Role, UserStatus } from "@prisma/client";
import { db } from "./db";
import { getPublicSettings } from "./settings";

export async function ensureChatConversation(conversationId: string) {
  return db.chatConversation.upsert({
    where: { conversationId },
    update: {},
    create: { conversationId },
  });
}

export async function getAdminRoutingEmail() {
  const [settings, admin] = await Promise.all([
    getPublicSettings(),
    db.user.findFirst({
      where: {
        role: Role.SYSTEM_ADMIN,
        status: UserStatus.ACTIVE,
      },
      orderBy: { createdAt: "asc" },
      select: { email: true },
    }),
  ]);

  return admin?.email || settings.contactEmail;
}
