import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { getSupportRouteStatus } from '@/lib/openai-support';

export const runtime = 'nodejs';

function buildStatusPayload() {
  const support = getSupportRouteStatus();
  return {
    chatkitReady: true,
    webhookReady: support.webhookReady,
    productionReady: support.chatkitReady && support.webhookReady,
  };
}

export async function GET() {
  return NextResponse.json(buildStatusPayload());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const conversationId =
    typeof body?.conversationId === 'string' && body.conversationId.trim()
      ? body.conversationId.trim()
      : `support-${crypto.randomUUID()}`;
  const mode = typeof body?.mode === 'string' ? body.mode.trim().toLowerCase() : 'conversation';
  const userId =
    typeof body?.userId === 'string' && body.userId.trim() ? body.userId.trim() : `visitor-${crypto.randomUUID()}`;

  if (mode === 'chatkit') {
    return NextResponse.json({
      ok: true,
      client_secret: `local-support-${userId}`,
      sessionId: `local-session-${userId}`,
      expires_at: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
      userId,
      ...buildStatusPayload(),
    });
  }

  return NextResponse.json({
    conversationId,
    messages: [],
    leadCaptured: false,
    routeLabel: 'General Support',
    lead: null,
    ...buildStatusPayload(),
  });
}
