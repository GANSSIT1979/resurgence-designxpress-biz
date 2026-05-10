import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireApiPermission } from '@/lib/api-utils';
import { buildSponsorInvoiceWhere, getCurrentSponsorContext } from '@/lib/sponsor-server';

function serializeInvoice(item: Awaited<ReturnType<typeof prisma.invoice.findFirstOrThrow>>) {
  return {
    ...item,
    issueDate: item.issueDate.toISOString(),
    dueDate: item.dueDate?.toISOString() ?? null,
    contactName: item.contactName ?? null,
    email: item.email ?? null,
    tier: item.tier ?? null,
    notes: item.notes ?? null,
    sponsorId: item.sponsorId ?? null,
  };
}

export async function GET(request: NextRequest) {
  const auth = await requireApiPermission(request, 'sponsor.billing.view');
  if (auth.error) return auth.error;

  const context = await getCurrentSponsorContext();
  if (!context) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const items = await prisma.invoice.findMany({
    where: buildSponsorInvoiceWhere(context.sponsorProfile),
    orderBy: [{ issueDate: 'desc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json({ items: items.map(serializeInvoice) });
}
