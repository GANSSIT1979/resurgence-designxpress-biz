import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentStaffContext } from '@/lib/staff-server';
import { serializeInquiry } from '@/lib/staff-api';

export async function GET() {
  const context = await getCurrentStaffContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const items = await prisma.inquiry.findMany({
    where: {
      OR: [
        { assignedStaffProfileId: context.staffProfile.id },
        {
          assignedStaffProfileId: null,
          status: { in: ['NEW', 'UNDER_REVIEW', 'CONTACTED', 'QUALIFIED', 'PENDING_RESPONSE'] },
        },
      ],
    },
    orderBy: [{ createdAt: 'desc' }],
  });

  return NextResponse.json({ items: items.map(serializeInquiry) });
}
