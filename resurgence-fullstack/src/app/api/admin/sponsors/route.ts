import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sponsorSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = sponsorSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid sponsor payload.' }, { status: 400 });
  }

  try {
    const item = await prisma.sponsor.create({ data: parsed.data });
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Sponsor slug must be unique.' }, { status: 400 });
  }
}
