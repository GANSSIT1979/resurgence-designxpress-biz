import { NextResponse } from 'next/server';
import { adminSettingsSchema } from '@/lib/validation';
import { upsertAppSettings } from '@/lib/settings';

export async function PUT(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = adminSettingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid settings payload.' }, { status: 400 });
  }

  try {
    const settings = await upsertAppSettings(parsed.data);
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: 'Unable to save settings.' }, { status: 400 });
  }
}
