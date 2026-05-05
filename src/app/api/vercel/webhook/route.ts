import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type VercelWebhookPayload = {
  type?: string;
  id?: string;
  createdAt?: number | string;
  payload?: Record<string, unknown>;
  [key: string]: unknown;
};

function getVercelWebhookSecret() {
  return process.env.VERCEL_WEBHOOK_SECRET || '';
}

function getBearerToken(request: Request) {
  const authorization = request.headers.get('authorization') || '';

  if (!authorization.toLowerCase().startsWith('bearer ')) {
    return '';
  }

  return authorization.slice('bearer '.length).trim();
}

function getHeaderSecret(request: Request) {
  return (
    request.headers.get('x-vercel-webhook-secret') ||
    request.headers.get('x-webhook-secret') ||
    ''
  ).trim();
}

function isAuthorized(request: Request) {
  const expectedSecret = getVercelWebhookSecret();

  if (!expectedSecret) {
    return false;
  }

  return getBearerToken(request) === expectedSecret || getHeaderSecret(request) === expectedSecret;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    webhookReady: Boolean(getVercelWebhookSecret()),
  });
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    console.warn('[VERCEL_WEBHOOK] Unauthorized request', {
      userAgent: request.headers.get('user-agent') || null,
      hasAuthorization: Boolean(request.headers.get('authorization')),
      hasHeaderSecret: Boolean(getHeaderSecret(request)),
    });

    return NextResponse.json({ error: 'Unauthorized webhook request.' }, { status: 401 });
  }

  let event: VercelWebhookPayload;

  try {
    event = (await request.json()) as VercelWebhookPayload;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  console.log('[VERCEL_WEBHOOK] received', {
    type: event.type || null,
    id: event.id || null,
    createdAt: event.createdAt || null,
  });

  return NextResponse.json({
    ok: true,
    received: true,
    eventType: event.type || null,
  });
}
