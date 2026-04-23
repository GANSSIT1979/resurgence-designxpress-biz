import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/api-utils';
import {
  canActorManageCreatorPost,
  requireCreatorActionActor,
} from '@/lib/creator-posts/action-auth';
import {
  duplicateCreatorPost,
  getCreatorActionPost,
} from '@/lib/creator-posts/action-posts';

export const runtime = 'nodejs';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { actor, error } = await requireCreatorActionActor(request);
  if (error || !actor) return error;

  const { postId } = await params;

  try {
    const post = await getCreatorActionPost(postId);
    if (!post) return fail('Creator post not found.', 404);
    if (!canActorManageCreatorPost(actor, post)) return fail('Forbidden.', 403);

    const result = await duplicateCreatorPost(actor, postId);
    if ('error' in result) return fail(result.error, 400);
    return ok({ action: 'duplicate', item: result.item }, 201);
  } catch (routeError) {
    const message = routeError instanceof Error ? routeError.message : 'Unable to duplicate the creator post.';
    return fail(message, 400);
  }
}
