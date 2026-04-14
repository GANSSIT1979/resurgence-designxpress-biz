import { db } from "@/lib/db";

export async function nextNumber(scope: string, prefix: string) {
  const counter = await db.counter.upsert({
    where: { scope },
    update: { value: { increment: 1 } },
    create: { scope, value: 1 }
  });

  return `${prefix}-${String(counter.value).padStart(6, "0")}`;
}
