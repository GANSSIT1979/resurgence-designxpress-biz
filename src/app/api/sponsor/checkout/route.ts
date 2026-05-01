import { NextResponse } from 'next/server';
import Stripe from 'stripe';
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

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  return new Stripe(secretKey, {
    apiVersion: '2025-02-24.acacia',
  });
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

    if (paymentMethod === 'STRIPE') {
      const stripe = getStripeClient();
      const baseUrl = getBaseUrl();

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'php',
              product_data: {
                name: `Sponsorship: ${submission.interestedPackage || 'DAYO Series Package'}`,
              },
              unit_amount: 100000,
            },
            quantity: 1,
          },
        ],
        metadata: {
          submissionId,
        },
        success_url: `${baseUrl}/payment/success`,
        cancel_url: `${baseUrl}/payment/cancel`,
      });

      return NextResponse.json({ url: session.url });
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
