import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/api-utils';
import { canManageFeedPost } from '@/lib/feed/authorization';
import { feedRouteError, requireFeedActor } from '@/lib/feed/api';
import { replacePostProducts } from '@/lib/feed/mutations';

export async function POST(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const { actor, error } = await requireFeedActor(request);
  if (error || !actor) return error;

  try {
    if (!(await canManageFeedPost(actor, postId))) return fail('Forbidden.', 403);
    const payload = await request.json().catch(() => null);
    const result = await replacePostProducts(postId, payload);
    if ('error' in result && result.error) return fail(result.error, 400);
    return ok({ item: result.item });
  } catch (routeError) {
    return feedRouteError(routeError);
  }
}
