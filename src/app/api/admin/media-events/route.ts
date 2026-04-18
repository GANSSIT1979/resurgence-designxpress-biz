import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { mediaEventSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = mediaEventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid gallery event payload.' }, { status: 400 });
  }

  try {
    const item = await prisma.mediaEvent.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description || null,
        eventDate: parsed.data.eventDate ? new Date(parsed.data.eventDate) : null,
        creatorId: parsed.data.creatorId || null,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive,
      },
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unable to create gallery event.' }, { status: 400 });
  }
}
