import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { creatorProfileSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = creatorProfileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  try {
    const item = await prisma.creatorProfile.create({
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
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Creator name must be unique.' }, { status: 400 });
  }
}
