import { NextRequest } from 'next/server';
import { InquiryStatus, UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { fail, ok, requireApiRole } from '@/lib/api-utils';

type Params = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const auth = await requireApiRole(request, [UserRole.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const { id } = await params;
  const item = await prisma.inquiry.findUnique({ where: { id } });
  if (!item) return fail('Inquiry not found.', 404);

  return ok({ item });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const auth = await requireApiRole(request, [UserRole.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return fail('Invalid request body.', 400);

  const nextStatus =
    typeof body.status === 'string' && Object.values(InquiryStatus).includes(body.status as InquiryStatus)
      ? (body.status as InquiryStatus)
      : null;

  if (!nextStatus) {
    return fail('A valid inquiry status is required.', 400);
  }

  const item = await prisma.inquiry.update({
    where: { id },
    data: {
      status: nextStatus,
      internalNotes:
        body.internalNotes === null ? null : typeof body.internalNotes === 'string' ? body.internalNotes : undefined,
      followUpAt:
        body.followUpAt === null
          ? null
          : typeof body.followUpAt === 'string' && body.followUpAt.trim()
            ? new Date(body.followUpAt)
            : undefined,
    },
  });

  return ok({ item });
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const auth = await requireApiRole(request, [UserRole.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const { id } = await params;
  await prisma.inquiry.delete({ where: { id } });
  return ok({ deleted: true });
}
