import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentStaffContext } from '@/lib/staff-server';
import { staffTaskSchema } from '@/lib/validation';
import { buildStaffTaskPayload, serializeStaffTask } from '@/lib/staff-api';

export async function GET() {
  const context = await getCurrentStaffContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const items = await prisma.staffTask.findMany({
    where: { staffProfileId: context.staffProfile.id },
    include: {
      inquiry: true,
      sponsorSubmission: true,
    },
    orderBy: [{ status: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json({ items: items.map(serializeStaffTask) });
}

export async function POST(request: Request) {
  const context = await getCurrentStaffContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const parsed = staffTaskSchema.parse(await request.json());
    const payload = await buildStaffTaskPayload(parsed, context.staffProfile.id);
    const item = await prisma.staffTask.create({
      data: payload,
      include: {
        inquiry: true,
        sponsorSubmission: true,
      },
    });
    return NextResponse.json({ item: serializeStaffTask(item) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to save task.' }, { status: 400 });
  }
}
