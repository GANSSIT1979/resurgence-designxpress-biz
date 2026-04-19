import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/api-utils';
import { getApiUser } from '@/lib/auth-server';
import { canCreateFeedPost } from '@/lib/feed/authorization';
import { feedRouteError, requireFeedActor } from '@/lib/feed/api';
import { createFeedPost } from '@/lib/feed/mutations';
import { getPublicFeed } from '@/lib/feed/queries';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get('limit') || '8');
  const cursor = url.searchParams.get('cursor');
  const user = await getApiUser(request);

  try {
    const feed = await getPublicFeed({ cursor, limit, viewerId: user?.id ?? null });
    return ok(feed);
  } catch (error) {
    return feedRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  const { actor, error } = await requireFeedActor(request);
  if (error || !actor) return error;
  if (!canCreateFeedPost(actor.role)) return fail('Forbidden. Creator, staff, or admin access is required.', 403);

  try {
    const payload = await request.json().catch(() => null);
    const result = await createFeedPost(actor, payload);
    if ('error' in result && result.error) return fail(result.error, 400);
    return ok({ item: result.item }, 201);
  } catch (routeError) {
    return feedRouteError(routeError);
  }
}
