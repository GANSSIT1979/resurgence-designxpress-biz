import { NextRequest } from 'next/server';
import { ok } from '@/lib/api-utils';
import { feedRouteError, requireFeedActor } from '@/lib/feed/api';
import { togglePostLike } from '@/lib/feed/mutations';

export async function POST(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const { actor, error } = await requireFeedActor(request);
  if (error || !actor) return error;

  try {
    return ok(await togglePostLike(actor, postId));
  } catch (routeError) {
    return feedRouteError(routeError);
  }
}
