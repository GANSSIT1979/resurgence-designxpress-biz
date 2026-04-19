import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/api-utils';
import { prisma } from '@/lib/prisma';
import { feedRouteError, requireFeedActor } from '@/lib/feed/api';
import { createPostComment } from '@/lib/feed/mutations';

export async function GET(_: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;

  try {
    const comments = await prisma.postComment.findMany({
      where: { postId, parentCommentId: null, isHidden: false },
      include: { user: { select: { id: true, displayName: true, role: true } } },
      orderBy: { createdAt: 'desc' },
      take: 40,
    });

    return ok({
      items: comments.map((comment) => ({
        id: comment.id,
        body: comment.body,
        createdAt: comment.createdAt.toISOString(),
        author: comment.user,
      })),
    });
  } catch (error) {
    return feedRouteError(error);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const { actor, error } = await requireFeedActor(request);
  if (error || !actor) return error;

  try {
    const payload = await request.json().catch(() => null);
    const result = await createPostComment(actor, postId, payload);
    if ('error' in result && result.error) return fail(result.error, 400);
    return ok({ item: result.item }, 201);
  } catch (routeError) {
    return feedRouteError(routeError);
  }
}
