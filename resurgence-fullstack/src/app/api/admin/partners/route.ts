import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { partnerSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = partnerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid partner payload.' }, { status: 400 });
  }

  try {
    const item = await prisma.partner.create({ data: parsed.data });
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Partner slug must be unique.' }, { status: 400 });
  }
}
