import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { submissionId, paymentMethod, referenceNumber } = body;

    const submission = await prisma.sponsorSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // STRIPE FLOW
    if (paymentMethod === 'STRIPE') {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [
          {
            price_data: {
              currency: 'php',
              product_data: {
                name: `Sponsorship: ${submission.interestedPackage}`,
              },
              unit_amount: 100000, // TODO: dynamic pricing later
            },
            quantity: 1,
          },
        ],
        metadata: {
          submissionId,
        },
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel`,
      });

      return NextResponse.json({ url: session.url });
    }

    // GCASH / MANUAL
    if (paymentMethod === 'GCASH') {
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
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
