import { NextResponse } from 'next/server';
import { db } from "@/lib/db";
import { verifySession, COOKIE_NAME } from '@/lib/auth';

function getCookieValue(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return null;

  const parts = cookieHeader.split(';').map((part) => part.trim());
  for (const part of parts) {
    if (part.startsWith(`${name}=`)) {
      return decodeURIComponent(part.slice(name.length + 1));
    }
  }

  return null;
}

export async function GET(request: Request) {
  const token = getCookieValue(request.headers.get('cookie'), COOKIE_NAME);
  const session = await verifySession(token || undefined);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const activityDelegate = (prisma as unknown as {
    activityLog?: {
      findMany: (args: Record<string, unknown>) => Promise<unknown[]>;
    };
  }).activityLog;

  if (!activityDelegate?.findMany) {
    return NextResponse.json({ items: [] });
  }

  const url = new URL(request.url);
  const take = Math.min(Number(url.searchParams.get('take') || '100'), 250);
  const action = url.searchParams.get('action');
  const resource = url.searchParams.get('resource');
  const actorEmail = url.searchParams.get('actorEmail');

  const where: Record<string, unknown> =
    session.role === 'SYSTEM_ADMIN'
      ? {}
      : { actorEmail: session.email };

  if (action) where.action = action;
  if (resource) where.resource = resource;
  if (actorEmail && session.role === 'SYSTEM_ADMIN') where.actorEmail = actorEmail;

  const items = await activityDelegate.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take,
  });

  return NextResponse.json({ items });
}

