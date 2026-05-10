import { NextRequest } from 'next/server';
import { ok, requireApiPermission } from '@/lib/api-utils';
import { getCashierReportSummary } from '@/lib/cashier-server';

export async function GET(request: NextRequest) {
  const auth = await requireApiPermission(request, 'cashier.reports.view');
  if (auth.error) return auth.error;

  const item = await getCashierReportSummary();
  return ok({ item });
}
