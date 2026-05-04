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
    const errorText = await response.text();
    throw new Error(`PayPal token request failed: ${errorText}`);
  }

  const data = await response.json();
  return data.access_token as string;
}

async function verifyPayPalWebhook(req: Request, rawBody: string) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    throw new Error('PAYPAL_WEBHOOK_ID is required');
  }

  const accessToken = await getPayPalAccessToken();
  const verificationPayload = {
    auth_algo: req.headers.get('paypal-auth-algo'),
    cert_url: req.headers.get('paypal-cert-url'),
    transmission_id: req.headers.get('paypal-transmission-id'),
    transmission_sig: req.headers.get('paypal-transmission-sig'),
    transmission_time: req.headers.get('paypal-transmission-time'),
    webhook_id: webhookId,
    webhook_event: JSON.parse(rawBody),
  };

  const response = await fetch(`${getPayPalBaseUrl()}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(verificationPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`PayPal webhook verification failed: ${errorText}`);
  }

  const data = await response.json();
  return data.verification_status === 'SUCCESS';
}

function getSubmissionId(event: any): string | null {
  const resource = event?.resource || {};
  const purchaseUnit = Array.isArray(resource.purchase_units) ? resource.purchase_units[0] : null;
  const capture = Array.isArray(resource.purchase_units?.[0]?.payments?.captures)
    ? resource.purchase_units[0].payments.captures[0]
    : null;

  return (
    resource.custom_id ||
    resource.invoice_id ||
    purchaseUnit?.custom_id ||
    purchaseUnit?.reference_id ||
    capture?.custom_id ||
    capture?.invoice_id ||
    null
  );
}

export async function POST(req: Request) {
  try {
    if (!hasUsableDatabaseUrl()) {
      return NextResponse.json({ error: 'Database is not configured' }, { status: 503 });
    }

    const rawBody = await req.text();
    const isVerified = await verifyPayPalWebhook(req, rawBody);

    if (!isVerified) {
      return NextResponse.json({ error: 'Invalid PayPal webhook signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event?.event_type as string | undefined;

    const paidEvents = new Set([
      'CHECKOUT.ORDER.APPROVED',
      'CHECKOUT.ORDER.COMPLETED',
      'PAYMENT.CAPTURE.COMPLETED',
    ]);

    if (!eventType || !paidEvents.has(eventType)) {
      return NextResponse.json({ received: true, ignored: true, eventType });
    }

    const submissionId = getSubmissionId(event);

    if (!submissionId) {
      console.warn('[paypal-webhook] Missing sponsor submission id.', eventType);
      return NextResponse.json({ received: true, warning: 'Missing submission id' });
    }

    const existing = await prisma.sponsorSubmission.findUnique({ where: { id: submissionId } });

    if (!existing) {
      console.warn('[paypal-webhook] Sponsor submission not found.', submissionId);
      return NextResponse.json({ received: true, warning: 'Submission not found' });
    }

    const paypalResourceId = event?.resource?.id || event?.id || 'unknown';
    const nextNotes = [
      existing.internalNotes,
      `PayPal webhook approved: ${eventType}`,
      `PayPal Resource: ${paypalResourceId}`,
    ]
      .filter(Boolean)
      .join('\n\n');

    await prisma.sponsorSubmission.update({
      where: { id: submissionId },
      data: {
        status: 'APPROVED',
        internalNotes: nextNotes,
      },
    });

    return NextResponse.json({ received: true, approved: true, submissionId });
  } catch (error) {
    console.error('[paypal-webhook] Failed to process PayPal webhook.', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
