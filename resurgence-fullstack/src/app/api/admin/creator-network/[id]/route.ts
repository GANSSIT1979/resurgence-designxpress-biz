import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { creatorProfileSchema } from '@/lib/validation';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = creatorProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  try {
    const item = await prisma.creatorProfile.update({
      where: { id },
      data: {
        ...parsed.data,
        biography: parsed.data.biography || null,
        journeyStory: parsed.data.journeyStory || null,
        pointsPerGame: parsed.data.pointsPerGame ?? null,
        assistsPerGame: parsed.data.assistsPerGame ?? null,
        reboundsPerGame: parsed.data.reboundsPerGame ?? null,
        imageUrl: parsed.data.imageUrl || null,
      },
    });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: 'Unable to update creator profile.' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await prisma.creatorProfile.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unable to delete creator profile.' }, { status: 400 });
  }
}
