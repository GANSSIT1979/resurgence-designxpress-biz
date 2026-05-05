import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { getSupportRouteStatus } from '@/lib/openai-support';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'not-required-for-webhook-verification',
});

type OpenAIWebhookEvent = {
  type?: string;
  data?: {
    id?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

function getWebhookSecret() {
  return process.env.OPENAI_WEBHOOK_SECRET || process.env.OPENAI_WEBHOOK_SIGNING_SECRET || '';
}

export async function GET() {
  const support = getSupportRouteStatus();

  return NextResponse.json({
    ok: true,
    webhookReady: support.webhookReady,
    hasWebhookSecret: Boolean(getWebhookSecret()),
  });
}

export async function POST(request: Request) {
  const webhookSecret = getWebhookSecret();

  if (!webhookSecret) {
    console.error('[OPENAI_WEBHOOK] Missing OPENAI_WEBHOOK_SECRET.');
    return NextResponse.json({ error: 'Webhook is not configured.' }, { status: 500 });
  }

  const rawBody = await request.text();
  const headers = request.headers;

  try {
    const event = openai.webhooks.unwrap(rawBody, headers, webhookSecret) as OpenAIWebhookEvent;

    switch (event.type) {
      case 'response.completed':
        console.log('[OPENAI_WEBHOOK] response.completed', { id: event.data?.id });
        break;
      case 'response.failed':
        console.error('[OPENAI_WEBHOOK] response.failed', { id: event.data?.id });
        break;
      default:
        console.log('[OPENAI_WEBHOOK] received', { type: event.type || null });
        break;
    }

    return NextResponse.json({ ok: true, verified: true, eventType: event.type || null });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid webhook signature or payload.';

    console.error('[OPENAI_WEBHOOK] Verification failed', {
      message,
      hasWebhookId: Boolean(headers.get('webhook-id')),
      hasWebhookTimestamp: Boolean(headers.get('webhook-timestamp')),
      hasWebhookSignature: Boolean(headers.get('webhook-signature')),
      bodyLength: rawBody.length,
    });

    return NextResponse.json({ error: 'Invalid webhook signature or payload.' }, { status: 400 });
  }
}
