import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentStaffContext } from '@/lib/staff-server';
import { staffAnnouncementSchema } from '@/lib/validation';
import { buildAnnouncementPayload, serializeAnnouncement } from '@/lib/staff-api';

export async function GET() {
  const context = await getCurrentStaffContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const items = await prisma.staffAnnouncement.findMany({
    where: { staffProfileId: context.staffProfile.id },
    orderBy: [{ isPinned: 'desc' }, { publishAt: 'desc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json({ items: items.map(serializeAnnouncement) });
}

export async function POST(request: Request) {
  const context = await getCurrentStaffContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const parsed = staffAnnouncementSchema.parse(await request.json());
    const item = await prisma.staffAnnouncement.create({
      data: buildAnnouncementPayload(parsed, context.staffProfile.id),
    });
    return NextResponse.json({ item: serializeAnnouncement(item) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to save announcement.' }, { status: 400 });
  }
}
