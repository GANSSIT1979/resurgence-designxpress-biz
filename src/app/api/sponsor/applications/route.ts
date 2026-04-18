import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSponsorContext } from '@/lib/sponsor-server';
import { sponsorSubmissionSchema } from '@/lib/validation';

export async function GET() {
  const context = await getCurrentSponsorContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const items = await prisma.sponsorSubmission.findMany({
    where: { sponsorProfileId: context.sponsorProfile.id },
    orderBy: [{ createdAt: 'desc' }],
  });

  return NextResponse.json({
    items: items.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      phone: item.phone ?? null,
      websiteUrl: item.websiteUrl ?? null,
      timeline: item.timeline ?? null,
      internalNotes: item.internalNotes ?? null,
    })),
  });
}

export async function POST(request: Request) {
  const context = await getCurrentSponsorContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const parsed = sponsorSubmissionSchema.parse(await request.json());
    const item = await prisma.sponsorSubmission.create({
      data: {
        ...parsed,
        phone: parsed.phone || null,
        websiteUrl: parsed.websiteUrl || null,
        timeline: parsed.timeline || null,
        sponsorProfileId: context.sponsorProfile.id,
      },
    });

    return NextResponse.json({
      item: {
        ...item,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        phone: item.phone ?? null,
        websiteUrl: item.websiteUrl ?? null,
        timeline: item.timeline ?? null,
        internalNotes: item.internalNotes ?? null,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Unable to save sponsor application.' }, { status: 400 });
  }
}
