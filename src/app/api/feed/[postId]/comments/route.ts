import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/api-utils';
import { getOptionalCommentActor, requireCommentActor } from '@/lib/contentpost-comments/action-auth';
import {
  createContentPostComment,
  listContentPostComments,
} from '@/lib/contentpost-comments/contentpost-comments';
import { feedRouteError } from '@/lib/feed/api';

export async function GET(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;

  try {
    const actor = await getOptionalCommentActor(request);
    const result = await listContentPostComments(postId, actor);
    if (!result) return fail('Comments are not available for this post.', 404);
    return ok({
      ...result,
      items: result.comments,
    });
  } catch (error) {
    return feedRouteError(error);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const { actor, error } = await requireCommentActor(request);
  if (error || !actor) return error;

  try {
    const payload = await request.json().catch(() => null);
    const result = await createContentPostComment(actor, postId, payload);
    if ('error' in result && result.error) return fail(result.error, 400);
    return ok(
      {
        item: result.comment,
        comment: result.comment,
        stats: result.stats,
      },
      201,
    );
  } catch (routeError) {
    return feedRouteError(routeError);
  }
}
