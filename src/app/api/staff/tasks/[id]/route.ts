import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentStaffContext } from '@/lib/staff-server';
import { staffTaskSchema } from '@/lib/validation';
import { buildStaffTaskPayload, serializeStaffTask } from '@/lib/staff-api';

async function getOwnedRecord(id: string, staffProfileId: string) {
  return prisma.staffTask.findFirst({ where: { id, staffProfileId } });
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getCurrentStaffContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const existing = await getOwnedRecord(id, context.staffProfile.id);
    if (!existing) return NextResponse.json({ error: 'Task not found.' }, { status: 404 });

    const parsed = staffTaskSchema.parse(await request.json());
    const payload = await buildStaffTaskPayload(parsed, context.staffProfile.id);
    const item = await prisma.staffTask.update({
      where: { id },
      data: payload,
      include: {
        inquiry: true,
        sponsorSubmission: true,
      },
    });
    return NextResponse.json({ item: serializeStaffTask(item) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update task.' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getCurrentStaffContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const existing = await getOwnedRecord(id, context.staffProfile.id);
    if (!existing) return NextResponse.json({ error: 'Task not found.' }, { status: 404 });

    await prisma.staffTask.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Unable to delete task.' }, { status: 400 });
  }
}
