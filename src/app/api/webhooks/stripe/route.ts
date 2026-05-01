import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function hasUsableDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL || '';
  return Boolean(databaseUrl && !databaseUrl.includes('@HOST:') && !databaseUrl.includes('HOST:6543'));
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

function buildWebhookNote(event: Stripe.Event, session: Stripe.Checkout.Session) {
  const paidAmount = typeof session.amount_total === 'number' ? session.amount_total / 100 : null;
  const currency = session.currency?.toUpperCase() || 'PHP';
  const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : '';

  return [
    `Stripe Event: ${event.type}`,
    `Stripe Checkout Session: ${session.id}`,
    paymentIntentId ? `Stripe Payment Intent: ${paymentIntentId}` : '',
    paidAmount !== null ? `Paid Amount: ${currency} ${paidAmount.toFixed(2)}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

async function markSponsorSubmissionPaid(event: Stripe.Event, session: Stripe.Checkout.Session) {
  const submissionId = typeof session.metadata?.submissionId === 'string' ? session.metadata.submissionId : '';

  if (!submissionId) {
    console.warn('[stripe-webhook] Missing submissionId metadata on checkout session.', session.id);
    return;
  }

  const existing = await prisma.sponsorSubmission.findUnique({
    where: { id: submissionId },
    select: { internalNotes: true },
  });

  if (!existing) {
    console.warn('[stripe-webhook] Sponsor submission not found.', submissionId);
    return;
  }

  const note = buildWebhookNote(event, session);
  const internalNotes = [existing.internalNotes, note].filter(Boolean).join('\n\n');

  await prisma.sponsorSubmission.update({
    where: { id: submissionId },
    data: {
      status: 'APPROVED',
      internalNotes,
    },
  });
}

export async function POST(req: Request) {
  if (!hasUsableDatabaseUrl()) {
    return NextResponse.json(
      { error: 'Database is not configured. Stripe webhook cannot update sponsor records.' },
      { status: 503 },
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: 'STRIPE_WEBHOOK_SECRET is not configured' }, { status: 500 });
  }

  const signature = (await headers()).get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
  }

  const rawBody = await req.text();
  let event: Stripe.Event;

  try {
    event = getStripeClient().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error('[stripe-webhook] Invalid signature.', error);
    return NextResponse.json({ error: 'Invalid Stripe signature' }, { status: 400 });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.payment_status === 'paid') {
        await markSponsorSubmissionPaid(event, session);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[stripe-webhook] Handler failed.', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
