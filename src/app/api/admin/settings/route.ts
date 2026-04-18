<<<<<<< HEAD
import { NextResponse } from 'next/server';
import { adminSettingsSchema } from '@/lib/validation';
import { upsertAppSettings } from '@/lib/settings';
=======
import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";
import { ok, requireApiRole } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const records = await db.setting.findMany();
  const settings = Object.fromEntries(
    records.map((item) => [item.key, typeof item.value === "string" ? item.value : JSON.stringify(item.value, null, 2)])
  );
  return ok({ settings });
}
>>>>>>> parent of d975526 (commit)

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(request, [Role.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

<<<<<<< HEAD
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid settings payload.' }, { status: 400 });
  }

  try {
    const settings = await upsertAppSettings(parsed.data);
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: 'Unable to save settings.' }, { status: 400 });
  }
=======
  const body = await request.json();
  const settings = body.settings || {};

  await Promise.all(
    Object.entries(settings).map(([key, value]) =>
      db.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) }
      })
    )
  );

  return ok({ success: true });
>>>>>>> parent of d975526 (commit)
}
