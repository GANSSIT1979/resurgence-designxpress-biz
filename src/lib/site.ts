import { db } from "@/lib/db";

export async function getSettingsMap() {
  const settings = await db.setting.findMany();
  return Object.fromEntries(settings.map((item) => [item.key, item.value]));
}
