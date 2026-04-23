import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/api-utils';
import {
  canActorManageCreatorPost,
  requireCreatorActionActor,
} from '@/lib/creator-posts/action-auth';
import {
  deleteCreatorPost,
  getCreatorActionPost,
} from '@/lib/creator-posts/action-posts';

export const runtime = 'nodejs';

export async function DELETE(
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

    await deleteCreatorPost(postId);
    return ok({ action: 'delete', postId });
  } catch (routeError) {
    const message = routeError instanceof Error ? routeError.message : 'Unable to delete the creator post.';
    return fail(message, 400);
  }
}
