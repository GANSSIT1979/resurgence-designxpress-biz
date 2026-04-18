import { NextRequest } from 'next/server';
import { UserRole } from '@prisma/client';
import { ok, requireApiRole } from '@/lib/api-utils';
import { getCashierReportSummary } from '@/lib/cashier-server';

export async function GET(request: NextRequest) {
  const auth = await requireApiRole(request, [UserRole.CASHIER, UserRole.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const item = await getCashierReportSummary();
  return ok({ item });
}
