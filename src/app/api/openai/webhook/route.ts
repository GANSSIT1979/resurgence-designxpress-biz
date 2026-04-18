import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

function decodeWebhookSecret(secret: string) {
  if (secret.startsWith('whsec_')) {
    return Buffer.from(secret.slice('whsec_'.length), 'base64');
  }

  return Buffer.from(secret, 'utf8');
}

function verifySignature(secret: string, payload: string, webhookId: string, timestamp: string, signatureHeader: string) {
  const expected = createHmac('sha256', decodeWebhookSecret(secret))
    .update(`${webhookId}.${timestamp}.${payload}`)
    .digest('base64');

  const provided = signatureHeader
    .split(' ')
    .flatMap((part) => part.split(','))
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => (part.startsWith('v1=') ? part.slice(3) : part.startsWith('v1,') ? part.slice(3) : part))
    .find(Boolean);

  if (!provided) return false;

  const expectedBuffer = Buffer.from(expected, 'utf8');
  const providedBuffer = Buffer.from(provided, 'utf8');

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    webhookReady: Boolean(process.env.OPENAI_WEBHOOK_SECRET),
  });
}

export async function POST(request: Request) {
  const webhookSecret = process.env.OPENAI_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: 'Missing OPENAI_WEBHOOK_SECRET.' }, { status: 500 });
  }

  const rawBody = await request.text();

  try {
    const webhookId = request.headers.get('webhook-id') || '';
    const timestamp = request.headers.get('webhook-timestamp') || '';
    const signature = request.headers.get('webhook-signature') || '';

    if (!webhookId || !timestamp || !signature) {
      return NextResponse.json({ error: 'Missing webhook signature headers.' }, { status: 400 });
    }

    if (!verifySignature(webhookSecret, rawBody, webhookId, timestamp, signature)) {
      return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 400 });
    }

    const event = JSON.parse(rawBody) as { type?: string; data?: { id?: string } };

    switch (event.type) {
      case 'response.completed':
        console.log('OpenAI webhook: response.completed', { id: event.data?.id });
        break;
      case 'response.failed':
        console.error('OpenAI webhook: response.failed', { id: event.data?.id });
        break;
      default:
        console.log('OpenAI webhook received', { type: event.type });
        break;
    }

    return NextResponse.json({ ok: true, verified: true, eventType: event.type || null });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid webhook payload.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
