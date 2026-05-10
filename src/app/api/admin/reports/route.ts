import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { adminReportSchema } from '@/lib/validation';
import { requireApiPermission } from '@/lib/api-utils';

export async function POST(request: NextRequest) {
  const auth = await requireApiPermission(request, 'admin.reports.manage');
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = adminReportSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid report payload.' }, { status: 400 });
  }

  try {
    const item = await prisma.adminReport.create({ data: parsed.data });
    return NextResponse.json({ item }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Unable to save report.' }, { status: 400 });
  }
}
