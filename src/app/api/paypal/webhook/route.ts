import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPayPalAccessToken, getPayPalBaseUrl } from '@/lib/paypal';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function hasUsableDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL || '';
  return Boolean(databaseUrl && !databaseUrl.includes('@HOST:') && !databaseUrl.includes('HOST:6543'));
}

function safeJsonParse(value: unknown) {
  if (!value || typeof value !== 'string') return {};
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

async function verifyPayPalWebhook(rawBody: string) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;

  if (!webhookId) {
    console.warn('[paypal-webhook] PAYPAL_WEBHOOK_ID is not configured. Skipping remote signature verification.');
    return true;
  }

  const h = await headers();
  const accessToken = await getPayPalAccessToken();
  const response = await fetch(`${getPayPalBaseUrl()}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      auth_algo: h.get('paypal-auth-algo'),
      cert_url: h.get('paypal-cert-url'),
      transmission_id: h.get('paypal-transmission-id'),
      transmission_sig: h.get('paypal-transmission-sig'),
      transmission_time: h.get('paypal-transmission-time'),
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody),
    }),
  });

  if (!response.ok) {
    console.error('[paypal-webhook] Signature verification request failed.', await response.text());
    return false;
  }

  const data = await response.json();
  return data.verification_status === 'SUCCESS';
}

function extractPayPalInvoiceId(event: any) {
  const resource = event?.resource || {};
  return resource.id || resource.invoice_id || resource.invoice?.id || resource.supplementary_data?.related_ids?.invoice_id || '';
}

function extractCaptureId(event: any) {
  const resource = event?.resource || {};
  return resource.id || resource.supplementary_data?.related_ids?.capture_id || '';
}

async function markInvoicePaid(event: any) {
  const invoiceDelegate = (prisma as any).invoice;
  if (!invoiceDelegate?.findFirst || !invoiceDelegate?.update) {
    console.warn('[paypal-webhook] Invoice Prisma delegate unavailable.');
    return;
  }

  const paypalInvoiceId = extractPayPalInvoiceId(event);
  const captureId = extractCaptureId(event);
  const resource = event?.resource || {};
  const amount = resource.amount || resource.invoice_amount || resource.payments?.transactions?.[0]?.amount || null;

  if (!paypalInvoiceId && !captureId) {
    console.warn('[paypal-webhook] Missing PayPal invoice/capture reference.', event?.id);
    return;
  }

  const invoices = await invoiceDelegate.findMany({ take: 200, orderBy: [{ createdAt: 'desc' }] });
  const match = invoices.find((invoice: any) => {
    const metadata = safeJsonParse(invoice.metadataJson);
    return metadata.paypalInvoiceId === paypalInvoiceId || metadata.paypalCaptureId === captureId;
  });

  if (!match) {
    console.warn('[paypal-webhook] No local invoice matched PayPal event.', { paypalInvoiceId, captureId });
    return;
  }

  const metadata = safeJsonParse(match.metadataJson);

  await invoiceDelegate.update({
    where: { id: match.id },
    data: {
      status: 'PAID',
      metadataJson: JSON.stringify({
        ...metadata,
        paypalInvoiceId: paypalInvoiceId || metadata.paypalInvoiceId,
        paypalCaptureId: captureId || metadata.paypalCaptureId,
        lastPayPalEventId: event.id,
        lastPayPalEventType: event.event_type,
        paidAt: new Date().toISOString(),
        paidAmount: amount,
      }),
    },
  });
}

export async function POST(req: Request) {
  const rawBody = await req.text();

  try {
    if (!hasUsableDatabaseUrl()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    const verified = await verifyPayPalWebhook(rawBody);
    if (!verified) {
      return NextResponse.json({ error: 'Invalid PayPal webhook signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event_type;

    if (['INVOICING.INVOICE.PAID', 'PAYMENT.CAPTURE.COMPLETED'].includes(eventType)) {
      await markInvoicePaid(event);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[paypal-webhook] Handler failed.', error);
    return NextResponse.json({ error: error.message || 'Webhook handler failed' }, { status: 500 });
  }
}
