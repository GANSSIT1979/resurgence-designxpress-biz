import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const updateSchema = z.object({
  status: z.enum(['SUBMITTED', 'UNDER_REVIEW', 'NEEDS_REVISION', 'APPROVED', 'REJECTED', 'CONVERTED_TO_ACTIVE_SPONSOR']).optional(),
  internalNotes: z.string().optional(),
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = updateSchema.parse(body);

    const item = await prisma.sponsorSubmission.update({
      where: { id },
      data: {
        status: parsed.status,
        internalNotes: typeof parsed.internalNotes === 'string' ? parsed.internalNotes : undefined,
      },
    });
    return NextResponse.json({ item });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update submission.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    await prisma.sponsorSubmission.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete submission.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
