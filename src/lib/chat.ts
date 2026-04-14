import { db } from "./db";

export async function ensureChatConversation(conversationId: string) {
  return db.chatConversation.upsert({
    where: { conversationId },
    update: {},
    create: { conversationId },
  });
}
