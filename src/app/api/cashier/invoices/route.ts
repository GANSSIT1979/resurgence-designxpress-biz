import { NextRequest } from 'next/server';
import { UserRole } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { fail, ok, requireApiRole } from '@/lib/api-utils';
import { generateDocumentNumber } from '@/lib/cashier-server';
import { invoiceSchema } from '@/lib/validation';

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
  const auth = await requireApiRole(request, [UserRole.CASHIER, UserRole.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const items = await prisma.invoice.findMany({ orderBy: [{ issueDate: 'desc' }, { createdAt: 'desc' }] });
  return ok({ items: items.map(serializeInvoice) });
}

export async function POST(request: NextRequest) {
  const auth = await requireApiRole(request, [UserRole.CASHIER, UserRole.SYSTEM_ADMIN]);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => null);
  const parsed = invoiceSchema.safeParse(body);
  if (!parsed.success) return fail('Invalid invoice payload.', 400);

  const item = await prisma.invoice.create({
    data: {
      invoiceNumber: parsed.data.invoiceNumber || (await generateDocumentNumber('INV')),
      companyName: parsed.data.companyName,
      contactName: parsed.data.contactName || null,
      email: parsed.data.email || null,
      tier: parsed.data.tier || null,
      description: parsed.data.description,
      amount: parsed.data.amount,
      balanceAmount: parsed.data.balanceAmount ?? parsed.data.amount,
      status: parsed.data.status,
      issueDate: new Date(parsed.data.issueDate),
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      notes: parsed.data.notes || null,
      sponsorId: parsed.data.sponsorId || null,
    },
  });

  return ok({ item: serializeInvoice(item) }, 201);
}
