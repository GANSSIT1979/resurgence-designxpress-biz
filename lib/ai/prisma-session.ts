import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { ensureChatConversation } from "@/lib/chat";

type AgentInputItem = Record<string, unknown>;

function textFromUnknown(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(textFromUnknown).filter(Boolean).join("\n").trim();
  if (!value || typeof value !== "object") return "";

  const record = value as Record<string, unknown>;
  if (typeof record.text === "string") return record.text;
  if (typeof record.value === "string") return record.value;
  if (typeof record.output_text === "string") return record.output_text;
  if (typeof record.input_text === "string") return record.input_text;
  if ("content" in record) return textFromUnknown(record.content);
  if ("summary" in record) return textFromUnknown(record.summary);
  return "";
}

function inferRole(item: AgentInputItem): string {
  const candidate = item as Record<string, unknown>;
  if (typeof candidate.role === "string") return candidate.role;
  if (typeof candidate.type === "string") {
    if (candidate.type.includes("input")) return "user";
    if (candidate.type.includes("output")) return "assistant";
  }
  return "assistant";
}

export class PrismaSession {
  constructor(private readonly conversationId: string) {}

  async getSessionId(): Promise<string> {
    await ensureChatConversation(this.conversationId);
    return this.conversationId;
  }

  async getItems(limit?: number): Promise<AgentInputItem[]> {
    await ensureChatConversation(this.conversationId);

    const rows = limit
      ? await db.chatMessage.findMany({
          where: { conversationId: this.conversationId },
          orderBy: { createdAt: "desc" },
          take: limit
        })
      : await db.chatMessage.findMany({
          where: { conversationId: this.conversationId },
          orderBy: { createdAt: "asc" }
        });

    const ordered = limit ? [...rows].reverse() : rows;

    return ordered
      .map((row) => row.rawItem as AgentInputItem | null)
      .filter((item): item is AgentInputItem => Boolean(item));
  }

  async addItems(items: AgentInputItem[]): Promise<void> {
    await ensureChatConversation(this.conversationId);

    if (!items.length) return;

    await db.chatMessage.createMany({
      data: items.map((item) => ({
        conversationId: this.conversationId,
        role: inferRole(item),
        content: textFromUnknown(item),
        rawItem: JSON.parse(JSON.stringify(item)) as Prisma.InputJsonValue
      }))
    });
  }

  async popItem(): Promise<AgentInputItem | undefined> {
    await ensureChatConversation(this.conversationId);

    const latest = await db.chatMessage.findFirst({
      where: { conversationId: this.conversationId },
      orderBy: { createdAt: "desc" }
    });

    if (!latest) return undefined;

    await db.chatMessage.delete({ where: { id: latest.id } });
    return (latest.rawItem as AgentInputItem | null) ?? undefined;
  }

  async clearSession(): Promise<void> {
    await ensureChatConversation(this.conversationId);
    await db.chatMessage.deleteMany({ where: { conversationId: this.conversationId } });
  }
}
