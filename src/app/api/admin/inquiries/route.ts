import { NextRequest } from 'next/server';
import { InquiryStatus, UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { fail, ok, requireApiRole } from '@/lib/api-utils';
import { inquirySchema } from '@/lib/validation';

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, [UserRole.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const items = await prisma.inquiry.findMany({ orderBy: [{ createdAt: 'desc' }] });
  return ok({ items });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(request, [UserRole.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = inquirySchema.safeParse(body);

  if (!parsed.success) {
    return fail('Invalid inquiry payload.', 400);
  }

  const item = await prisma.inquiry.create({
    data: {
      ...parsed.data,
      organization: parsed.data.organization || null,
      phone: parsed.data.phone || null,
      status: InquiryStatus.NEW,
    },
  });

  return ok({ item }, 201);
}
