import { fail, ok } from '@/lib/api-utils';
import { getContentPostCommentStats } from '@/lib/contentpost-comments/contentpost-comments';
import { feedRouteError } from '@/lib/feed/api';
import { getPublicFeedPostMetrics } from '@/lib/feed/queries';

export async function GET(_: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;

  try {
    const [metrics, comments] = await Promise.all([
      getPublicFeedPostMetrics(postId),
      getContentPostCommentStats(postId),
    ]);
    if (!metrics || !comments) return fail('Feed post not found.', 404);
    return ok({ metrics, comments });
  } catch (error) {
    return feedRouteError(error);
  }
}
