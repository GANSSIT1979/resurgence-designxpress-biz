import { NextResponse } from 'next/server';
import { getCashierReportSummary } from '@/lib/cashier-server';

export async function GET() {
  const summary = await getCashierReportSummary();
  return NextResponse.json(summary);
}
