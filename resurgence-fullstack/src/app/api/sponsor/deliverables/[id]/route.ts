import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSponsorContext } from '@/lib/sponsor-server';
import { sponsorDeliverableSchema } from '@/lib/validation';

async function getOwnedRecord(id: string, sponsorProfileId: string) {
  return prisma.sponsorDeliverable.findFirst({ where: { id, sponsorProfileId } });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getCurrentSponsorContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const existing = await getOwnedRecord(id, context.sponsorProfile.id);
    if (!existing) return NextResponse.json({ error: 'Deliverable not found.' }, { status: 404 });

    const parsed = sponsorDeliverableSchema.parse(await request.json());
    const item = await prisma.sponsorDeliverable.update({
      where: { id },
      data: {
        title: parsed.title,
        category: parsed.category,
        status: parsed.status,
        dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
        assetLink: parsed.assetLink || null,
        sponsorNotes: parsed.sponsorNotes || null,
      },
    });

    return NextResponse.json({
      item: {
        ...item,
        dueDate: item.dueDate ? item.dueDate.toISOString() : null,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        assetLink: item.assetLink ?? null,
        sponsorNotes: item.sponsorNotes ?? null,
        adminNotes: item.adminNotes ?? null,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Unable to update deliverable.' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getCurrentSponsorContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const existing = await getOwnedRecord(id, context.sponsorProfile.id);
    if (!existing) return NextResponse.json({ error: 'Deliverable not found.' }, { status: 404 });

    await prisma.sponsorDeliverable.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to delete deliverable.' }, { status: 400 });
  }
}
