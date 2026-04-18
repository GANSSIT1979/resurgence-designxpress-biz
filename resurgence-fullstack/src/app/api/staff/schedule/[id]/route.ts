import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentStaffContext } from '@/lib/staff-server';
import { staffScheduleSchema } from '@/lib/validation';
import { buildSchedulePayload, serializeScheduleItem } from '@/lib/staff-api';

async function getOwnedRecord(id: string, staffProfileId: string) {
  return prisma.staffScheduleItem.findFirst({ where: { id, staffProfileId } });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getCurrentStaffContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const existing = await getOwnedRecord(id, context.staffProfile.id);
    if (!existing) return NextResponse.json({ error: 'Schedule item not found.' }, { status: 404 });

    const parsed = staffScheduleSchema.parse(await request.json());
    const item = await prisma.staffScheduleItem.update({
      where: { id },
      data: buildSchedulePayload(parsed, context.staffProfile.id),
    });
    return NextResponse.json({ item: serializeScheduleItem(item) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update schedule item.' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getCurrentStaffContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const existing = await getOwnedRecord(id, context.staffProfile.id);
    if (!existing) return NextResponse.json({ error: 'Schedule item not found.' }, { status: 404 });

    await prisma.staffScheduleItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to delete schedule item.' }, { status: 400 });
  }
}
