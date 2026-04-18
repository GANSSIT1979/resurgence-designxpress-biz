import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentStaffContext } from '@/lib/staff-server';
import { staffScheduleSchema } from '@/lib/validation';
import { buildSchedulePayload, serializeScheduleItem } from '@/lib/staff-api';

export async function GET() {
  const context = await getCurrentStaffContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const items = await prisma.staffScheduleItem.findMany({
    where: { staffProfileId: context.staffProfile.id },
    orderBy: [{ startAt: 'asc' }],
  });

  return NextResponse.json({ items: items.map(serializeScheduleItem) });
}

export async function POST(request: Request) {
  const context = await getCurrentStaffContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const parsed = staffScheduleSchema.parse(await request.json());
    const item = await prisma.staffScheduleItem.create({
      data: buildSchedulePayload(parsed, context.staffProfile.id),
    });
    return NextResponse.json({ item: serializeScheduleItem(item) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to save schedule item.' }, { status: 400 });
  }
}
