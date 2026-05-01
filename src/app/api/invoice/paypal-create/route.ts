import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculatePayPalInvoice } from '@/lib/invoice/paypal-config';

function hasUsableDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL || '';
  return Boolean(databaseUrl && !databaseUrl.includes('@HOST:') && !databaseUrl.includes('HOST:6543'));
}

function generateInvoiceNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `DX-${y}${m}${d}-${suffix}`;
}

type NormalizedInvoiceItem = {
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  total: number;
};

function normalizeItems(items: any[]): NormalizedInvoiceItem[] {
  return items.map((item) => ({
    name: String(item.name || '').trim(),
    description: String(item.description || '').trim(),
    quantity: Number(item.quantity || 0),
    unitPrice: Number(item.unitPrice || 0),
    currency: item.currency || 'PHP',
    total: Number(item.quantity || 0) * Number(item.unitPrice || 0),
  }));
}

export async function POST(req: Request) {
  try {
    if (!hasUsableDatabaseUrl()) {
      return NextResponse.json(
        { error: 'Database is not configured. Set a valid DATABASE_URL before saving invoices.' },
        { status: 503 },
      );
    }

    const body = await req.json();
    const items = normalizeItems(body.items || []);

    if (!items.length) {
      return NextResponse.json({ error: 'At least one invoice item is required' }, { status: 400 });
    }

    if (items.some((item) => !item.name || item.quantity <= 0 || item.unitPrice < 0)) {
      return NextResponse.json({ error: 'Invalid invoice item payload' }, { status: 400 });
    }

    const customerEmail = String(body.customerEmail || body.customer?.email || '').trim();
    const customerName = String(body.customerName || body.customer?.name || '').trim();

    if (!customerEmail) {
      return NextResponse.json({ error: 'customerEmail is required' }, { status: 400 });
    }

    const summary = calculatePayPalInvoice(items, {
      discount: Number(body.discount || 0),
      shipping: Number(body.shipping || 0),
      otherAmount: Number(body.otherAmount || 0),
      tax: Number(body.tax || 0),
    });

    const invoiceNumber = body.invoiceNumber || generateInvoiceNumber();
    const currency = body.currency || 'PHP';

    const invoiceDelegate = (prisma as any).invoice;

    if (!invoiceDelegate?.create) {
      return NextResponse.json(
        {
          error: 'Invoice Prisma model is unavailable in the generated client. Run prisma generate/deploy after schema sync.',
        },
        { status: 500 },
      );
    }

    const saved = await invoiceDelegate.create({
      data: {
        invoiceNumber,
        status: body.status || 'DRAFT',
        currency,
        customerName: customerName || customerEmail,
        customerEmail,
        subtotal: summary.subtotal,
        discount: summary.discount,
        shipping: summary.shipping,
        tax: summary.tax,
        total: summary.total,
        notes: body.notesToRecipient || body.notes || null,
        terms: body.termsAndConditions || body.terms || null,
        referenceNumber: body.referenceNumber || null,
        memo: body.memoToSelf || null,
        metadataJson: JSON.stringify({
          invoiceType: 'paypal_invoice',
          otherAmount: summary.otherAmount,
          paymentOptions: body.paymentOptions || null,
          rawItems: items,
        }),
        items: {
          create: items.map((item) => ({
            name: item.name,
            description: item.description || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
            currency,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({ invoice: saved, summary });
  } catch (error: any) {
    console.error('[paypal-invoice-create]', error);
    return NextResponse.json({ error: error.message || 'Failed to save invoice' }, { status: 500 });
  }
}
