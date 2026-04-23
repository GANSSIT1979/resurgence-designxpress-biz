import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/api-utils';
import { requireCommentActor } from '@/lib/contentpost-comments/action-auth';
import { createContentPostComment } from '@/lib/contentpost-comments/contentpost-comments';
import { feedRouteError } from '@/lib/feed/api';

export async function POST(request: NextRequest, { params }: { params: Promise<{ postId: string; commentId: string }> }) {
  const { postId, commentId } = await params;
  const { actor, error } = await requireCommentActor(request);
  if (error || !actor) return error;

  try {
    const payload = await request.json().catch(() => null);
    const result = await createContentPostComment(actor, postId, {
      ...(payload && typeof payload === 'object' ? payload : {}),
      parentCommentId: commentId,
    });
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
