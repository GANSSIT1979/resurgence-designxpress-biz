import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const statusSchema = z.object({
  status: z.enum(['NEW', 'UNDER_REVIEW', 'CONTACTED', 'QUALIFIED', 'PENDING_RESPONSE', 'CLOSED', 'ARCHIVED']),
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = statusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid inquiry status.' }, { status: 400 });
  }

  try {
    const item = await prisma.inquiry.update({ where: { id }, data: { status: parsed.data.status } });
    return NextResponse.json({ item });
  } catch {
    return NextResponse.json({ error: 'Unable to update inquiry.' }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.inquiry.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unable to delete inquiry.' }, { status: 400 });
  }
}
