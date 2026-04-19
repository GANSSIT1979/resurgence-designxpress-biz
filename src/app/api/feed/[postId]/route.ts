import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/api-utils';
import { canManageFeedPost } from '@/lib/feed/authorization';
import { feedRouteError, requireFeedActor } from '@/lib/feed/api';
import { softDeleteFeedPost, updateFeedPost } from '@/lib/feed/mutations';
import { getPostForApi } from '@/lib/feed/queries';
import { serializeContentPost } from '@/lib/feed/serializers';

export async function GET(_: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;

  try {
    const item = await getPostForApi(postId);
    if (!item || item.status !== 'PUBLISHED' || item.visibility !== 'PUBLIC') return fail('Feed post not found.', 404);
    return ok({ item: serializeContentPost(item) });
  } catch (error) {
    return feedRouteError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const { actor, error } = await requireFeedActor(request);
  if (error || !actor) return error;

  try {
    if (!(await canManageFeedPost(actor, postId))) return fail('Forbidden.', 403);
    const payload = await request.json().catch(() => null);
    const result = await updateFeedPost(actor, postId, payload);
    if ('error' in result && result.error) return fail(result.error, 400);
    return ok({ item: result.item });
  } catch (routeError) {
    return feedRouteError(routeError);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const { actor, error } = await requireFeedActor(request);
  if (error || !actor) return error;

  try {
    if (!(await canManageFeedPost(actor, postId))) return fail('Forbidden.', 403);
    return ok(await softDeleteFeedPost(postId));
  } catch (routeError) {
    return feedRouteError(routeError);
  }
}
