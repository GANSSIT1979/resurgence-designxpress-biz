import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function hasUsableDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL || '';
  return Boolean(databaseUrl && !databaseUrl.includes('@HOST:') && !databaseUrl.includes('HOST:6543'));
}

function getPayPalBaseUrl() {
  return process.env.PAYPAL_ENV === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
}

async function getPayPalAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET are required');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch(`${getPayPalBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    throw new Error(`PayPal token request failed: ${await response.text()}`);
  }

  const data = await response.json();
  return data.access_token as string;
}

function extractCaptureSummary(order: any) {
  const purchaseUnit = order?.purchase_units?.[0];
  const capture = purchaseUnit?.payments?.captures?.[0];
  const amount = capture?.amount;

  return {
    submissionId: purchaseUnit?.custom_id || purchaseUnit?.reference_id || '',
    orderId: order?.id || '',
    captureId: capture?.id || '',
    status: order?.status || capture?.status || '',
    amount: amount?.value || '',
    currency: amount?.currency_code || '',
    payerEmail: order?.payer?.email_address || '',
  };
}

export async function POST(req: Request) {
  try {
    if (!hasUsableDatabaseUrl()) {
      return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
    }

    const body = await req.json();
    const orderId = typeof body.orderId === 'string' ? body.orderId.trim() : '';
    const fallbackSubmissionId = typeof body.submissionId === 'string' ? body.submissionId.trim() : '';

    if (!orderId) {
      return NextResponse.json({ error: 'orderId is required' }, { status: 400 });
    }

    const accessToken = await getPayPalAccessToken();
    const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const order = await response.json();

    if (!response.ok) {
      console.error('[paypal-capture] Capture failed.', order);
      return NextResponse.json({ error: 'PayPal capture failed', details: order }, { status: 502 });
    }

    const summary = extractCaptureSummary(order);
    const submissionId = summary.submissionId || fallbackSubmissionId;

    if (!submissionId) {
      return NextResponse.json({ error: 'Missing sponsor submission reference on PayPal order' }, { status: 400 });
    }

    const existing = await prisma.sponsorSubmission.findUnique({
      where: { id: submissionId },
      select: { internalNotes: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Sponsor submission not found' }, { status: 404 });
    }

    const note = [
      'PayPal Payment Captured',
      `PayPal Order: ${summary.orderId || orderId}`,
      summary.captureId ? `PayPal Capture: ${summary.captureId}` : '',
      summary.amount && summary.currency ? `Paid Amount: ${summary.currency} ${summary.amount}` : '',
      summary.payerEmail ? `Payer Email: ${summary.payerEmail}` : '',
      summary.status ? `PayPal Status: ${summary.status}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    await prisma.sponsorSubmission.update({
      where: { id: submissionId },
      data: {
        status: 'APPROVED',
        internalNotes: [existing.internalNotes, note].filter(Boolean).join('\n\n'),
      },
    });

    return NextResponse.json({ success: true, submissionId, orderId: summary.orderId || orderId, captureId: summary.captureId });
  } catch (error) {
    console.error('[paypal-capture] Capture handler failed.', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
