import { NextRequest } from 'next/server';
import { getApiUser } from '@/lib/auth-server';
import type { ViewerActor } from './types';

export async function getViewerActor(request: NextRequest): Promise<ViewerActor> {
  const user = await getApiUser(request);

  return {
    userId: user?.id ?? null,
    role: user?.role ?? null,
    ip:
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('cf-connecting-ip') ||
      null,
    userAgent: request.headers.get('user-agent'),
  };
}

function hashViewerIdentity(raw: string) {
  let hash = 0;
  for (let index = 0; index < raw.length; index += 1) {
    hash = (hash * 31 + raw.charCodeAt(index)) | 0;
  }
  return `viewer_${Math.abs(hash)}`;
}

export function getViewerSessionId({
  actor,
  explicitViewerSessionId,
  fallbackPostId,
}: {
  actor: ViewerActor;
  explicitViewerSessionId?: string | null;
  fallbackPostId?: string | null;
}) {
  const explicit = explicitViewerSessionId?.trim();
  if (explicit) return explicit.slice(0, 160);

  if (actor.userId) {
    return `user_${actor.userId}`;
  }

  const raw = [actor.ip || 'no-ip', actor.userAgent || 'no-ua', fallbackPostId || 'post']
    .join('|')
    .slice(0, 500);

  return hashViewerIdentity(raw);
}
