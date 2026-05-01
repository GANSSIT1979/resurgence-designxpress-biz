import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function hasUsableDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL || '';
  return Boolean(databaseUrl && !databaseUrl.includes('@HOST:') && !databaseUrl.includes('HOST:6543'));
}

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    'https://www.resurgence-dx.biz'
  );
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

export async function POST(req: Request) {
  try {
    if (!hasUsableDatabaseUrl()) {
      return NextResponse.json(
        { error: 'Database is not configured. Please set a valid DATABASE_URL before accepting payments.' },
        { status: 503 },
      );
    }

    const body = await req.json();
    const submissionId = typeof body.submissionId === 'string' ? body.submissionId.trim() : '';
    const paymentMethod = typeof body.paymentMethod === 'string' ? body.paymentMethod.trim().toUpperCase() : '';
    const referenceNumber = typeof body.referenceNumber === 'string' ? body.referenceNumber.trim() : '';

    if (!submissionId) {
      return NextResponse.json({ error: 'submissionId is required' }, { status: 400 });
    }

    const submission = await prisma.sponsorSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    if (paymentMethod === 'PAYPAL') {
      const accessToken = await getPayPalAccessToken();
      const baseUrl = getBaseUrl();
      const amount = process.env.PAYPAL_SPONSOR_AMOUNT || '1000.00';
      const currency = process.env.PAYPAL_CURRENCY || 'PHP';

      const response = await fetch(`${getPayPalBaseUrl()}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: submissionId,
              description: `Sponsorship: ${submission.interestedPackage || 'DAYO Series Package'}`,
              custom_id: submissionId,
              amount: {
                currency_code: currency,
                value: amount,
              },
            },
          ],
          application_context: {
            brand_name: 'RESURGENCE x DesignXpress',
            landing_page: 'BILLING',
            user_action: 'PAY_NOW',
            return_url: `${baseUrl}/payment/success?provider=paypal&submissionId=${encodeURIComponent(submissionId)}`,
            cancel_url: `${baseUrl}/payment/cancel?provider=paypal&submissionId=${encodeURIComponent(submissionId)}`,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('[paypal-checkout] Order creation failed.', data);
        return NextResponse.json({ error: 'PayPal order creation failed' }, { status: 502 });
      }

      const approveLink = Array.isArray(data.links)
        ? data.links.find((link: { rel?: string; href?: string }) => link.rel === 'approve')?.href
        : null;

      await prisma.sponsorSubmission.update({
        where: { id: submissionId },
        data: {
          status: 'UNDER_REVIEW',
          internalNotes: [`PayPal Order: ${data.id}`, submission.internalNotes].filter(Boolean).join('\n\n'),
        },
      });

      return NextResponse.json({ orderId: data.id, url: approveLink });
    }

    if (paymentMethod === 'GCASH') {
      if (!referenceNumber) {
        return NextResponse.json({ error: 'referenceNumber is required for GCash payments' }, { status: 400 });
      }

      await prisma.sponsorSubmission.update({
        where: { id: submissionId },
        data: {
          internalNotes: `GCash Ref: ${referenceNumber}`,
          status: 'UNDER_REVIEW',
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid payment method' }, { status: 400 });
  } catch (error) {
    console.error('[sponsor-checkout] Checkout failed.', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
