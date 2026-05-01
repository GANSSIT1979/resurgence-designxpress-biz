import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPayPalAccessToken, getPayPalBaseUrl, paypalAmount } from '@/lib/paypal';

function hasUsableDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL || '';
  return Boolean(databaseUrl && !databaseUrl.includes('@HOST:') && !databaseUrl.includes('HOST:6543'));
}

export async function POST(req: Request) {
  try {
    if (!hasUsableDatabaseUrl()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const { invoiceId } = await req.json();

    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId required' }, { status: 400 });
    }

    const invoice = await (prisma as any).invoice.findUnique({
      where: { id: invoiceId },
      include: { items: true },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const accessToken = await getPayPalAccessToken();

    // Step 1: Create PayPal Invoice Draft
    const createRes = await fetch(`${getPayPalBaseUrl()}/v2/invoicing/invoices`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        detail: {
          currency_code: invoice.currency || 'PHP',
          note: invoice.notes || undefined,
          terms_and_conditions: invoice.terms || undefined,
          reference: invoice.invoiceNumber,
        },
        invoicer: {
          name: { given_name: 'DesignXpress', surname: 'Billing' },
        },
        primary_recipients: [
          {
            billing_info: {
              email_address: invoice.customerEmail,
              name: { given_name: invoice.customerName || 'Customer' },
            },
          },
        ],
        items: invoice.items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity.toString(),
          unit_amount: {
            currency_code: invoice.currency || 'PHP',
            value: paypalAmount(item.unitPrice),
          },
        })),
      }),
    });

    const created = await createRes.json();

    if (!createRes.ok) {
      console.error('[paypal-invoice-create]', created);
      return NextResponse.json({ error: 'Failed to create PayPal invoice', details: created }, { status: 500 });
    }

    const paypalInvoiceId = created.id;

    // Step 2: Send Invoice
    const sendRes = await fetch(`${getPayPalBaseUrl()}/v2/invoicing/invoices/${paypalInvoiceId}/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!sendRes.ok) {
      const err = await sendRes.text();
      console.error('[paypal-invoice-send]', err);
      return NextResponse.json({ error: 'Invoice created but failed to send' }, { status: 500 });
    }

    // Step 3: Save PayPal reference
    await (prisma as any).invoice.update({
      where: { id: invoiceId },
      data: {
        status: 'SENT',
        metadataJson: JSON.stringify({
          ...(invoice.metadataJson ? JSON.parse(invoice.metadataJson) : {}),
          paypalInvoiceId,
        }),
      },
    });

    return NextResponse.json({ success: true, paypalInvoiceId });
  } catch (err: any) {
    console.error('[paypal-invoice-send]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
