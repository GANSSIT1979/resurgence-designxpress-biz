import { fail, ok } from '@/lib/api-utils';
import { feedRouteError } from '@/lib/feed/api';
import { incrementPublicPostShare } from '@/lib/feed/mutations';

export async function POST(_: Request, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;

  try {
    const result = await incrementPublicPostShare(postId);
    if (!result) return fail('Feed post not found.', 404);
    return ok(result);
  } catch (error) {
    return feedRouteError(error);
  }
}
