import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentStaffContext } from '@/lib/staff-server';
import { serializeInquiry, buildInquiryUpdatePayload } from '@/lib/staff-api';
import { staffInquiryUpdateSchema } from '@/lib/validation';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const context = await getCurrentStaffContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const existing = await prisma.inquiry.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Inquiry not found.' }, { status: 404 });
    if (existing.assignedStaffProfileId && existing.assignedStaffProfileId !== context.staffProfile.id) {
      return NextResponse.json({ error: 'Inquiry is assigned to another staff member.' }, { status: 403 });
    }

    const parsed = staffInquiryUpdateSchema.parse(await request.json());
    const item = await prisma.inquiry.update({
      where: { id },
      data: buildInquiryUpdatePayload(parsed, context.staffProfile.id),
    });

    return NextResponse.json({ item: serializeInquiry(item) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update inquiry.' }, { status: 400 });
  }
}
