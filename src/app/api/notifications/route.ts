import { NextResponse } from 'next/server';
import { getAutomationInbox } from '@/lib/notifications';
import { getCurrentSessionUser } from '@/lib/session-server';

export async function GET(request: Request) {
  const context = await getCurrentSessionUser();
  if (!context) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const requestedLimit = Number(url.searchParams.get('limit') || '6');
  const limit = Number.isFinite(requestedLimit) ? Math.max(1, Math.min(20, requestedLimit)) : 6;
  const inbox = await getAutomationInbox(context.user.role, context.user.id, limit);

  return NextResponse.json(inbox, { status: inbox.degradedReason ? 503 : 200 });
}

