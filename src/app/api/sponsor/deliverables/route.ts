import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentSponsorContext } from '@/lib/sponsor-server';
import { sponsorDeliverableSchema } from '@/lib/validation';

export async function GET() {
  const context = await getCurrentSponsorContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const items = await prisma.sponsorDeliverable.findMany({
    where: { sponsorProfileId: context.sponsorProfile.id },
    orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json({
    items: items.map((item) => ({
      ...item,
      dueDate: item.dueDate ? item.dueDate.toISOString() : null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      assetLink: item.assetLink ?? null,
      sponsorNotes: item.sponsorNotes ?? null,
      adminNotes: item.adminNotes ?? null,
    })),
  });
}

export async function POST(request: Request) {
  const context = await getCurrentSponsorContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const parsed = sponsorDeliverableSchema.parse(await request.json());
    const item = await prisma.sponsorDeliverable.create({
      data: {
        sponsorProfileId: context.sponsorProfile.id,
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
    return NextResponse.json({ error: 'Unable to save deliverable.' }, { status: 400 });
  }
}
