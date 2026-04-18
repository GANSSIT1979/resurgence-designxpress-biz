import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { adminReportSchema } from '@/lib/validation';

export async function POST(request: Request) {
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
