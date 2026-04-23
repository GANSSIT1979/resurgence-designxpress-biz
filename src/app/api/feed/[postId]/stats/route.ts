import { fail, ok } from '@/lib/api-utils';
import { feedRouteError } from '@/lib/feed/api';
import { getPublicFeedPostMetrics } from '@/lib/feed/queries';

export async function GET(_: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;

  try {
    const metrics = await getPublicFeedPostMetrics(postId);
    if (!metrics) return fail('Feed post not found.', 404);
    return ok({ metrics });
  } catch (error) {
    return feedRouteError(error);
  }
}
