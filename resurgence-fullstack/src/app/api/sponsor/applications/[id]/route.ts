import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSponsorContext } from '@/lib/sponsor-server';
import { sponsorSubmissionSchema } from '@/lib/validation';

async function getOwnedRecord(id: string, sponsorProfileId: string) {
  return prisma.sponsorSubmission.findFirst({ where: { id, sponsorProfileId } });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getCurrentSponsorContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const existing = await getOwnedRecord(id, context.sponsorProfile.id);
    if (!existing) return NextResponse.json({ error: 'Application not found.' }, { status: 404 });

    const parsed = sponsorSubmissionSchema.parse(await request.json());
    const item = await prisma.sponsorSubmission.update({
      where: { id },
      data: {
        ...parsed,
        phone: parsed.phone || null,
        websiteUrl: parsed.websiteUrl || null,
        timeline: parsed.timeline || null,
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
    return NextResponse.json({ error: 'Unable to update sponsor application.' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getCurrentSponsorContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const existing = await getOwnedRecord(id, context.sponsorProfile.id);
    if (!existing) return NextResponse.json({ error: 'Application not found.' }, { status: 404 });

    await prisma.sponsorSubmission.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to delete sponsor application.' }, { status: 400 });
  }
}
