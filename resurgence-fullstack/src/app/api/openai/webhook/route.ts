import OpenAI from 'openai';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(request: Request) {
  const webhookSecret = process.env.OPENAI_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json({ error: 'Missing OPENAI_WEBHOOK_SECRET.' }, { status: 500 });
  }

  const rawBody = await request.text();

  try {
    const event = client.webhooks.unwrap(rawBody, request.headers, {
      secret: webhookSecret,
    });

    switch (event.type) {
      case 'response.completed':
        console.log('OpenAI webhook: response.completed', {
          id: event.data?.id,
        });
        break;
      case 'response.failed':
        console.error('OpenAI webhook: response.failed', {
          id: event.data?.id,
          error: event.data,
        });
        break;
      default:
        console.log('OpenAI webhook received', { type: event.type });
        break;
    }

    return NextResponse.json({ ok: true, type: event.type });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid webhook signature.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
