import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiPermission } from '@/lib/api-utils';

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiPermission(request, 'admin.reports.manage');
  if (auth.error) return auth.error;

  const { id } = await params;
  try {
    await prisma.adminReport.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unable to delete report.' }, { status: 400 });
  }
}
