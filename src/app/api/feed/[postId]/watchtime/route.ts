import { NextRequest } from 'next/server';
import { z } from 'zod';
import { fail, ok } from '@/lib/api-utils';
import { getViewerActor, getViewerSessionId } from '@/lib/feed-analytics/action-auth';
import { registerContentPostWatchTime } from '@/lib/feed-analytics/contentpost-analytics';
import { feedRouteError } from '@/lib/feed/api';

const bodySchema = z.object({
  viewerSessionId: z.string().trim().min(1).max(160).optional(),
  secondsWatched: z.coerce.number().min(0).max(300),
  completed: z.boolean().optional(),
  source: z.string().trim().max(80).optional(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;

  try {
    const payload = bodySchema.safeParse(await request.json().catch(() => ({})));
    if (!payload.success) return fail('Invalid watch-time payload.', 400);

    const actor = await getViewerActor(request);
    const analytics = await registerContentPostWatchTime(
      {
        postId,
        secondsWatched: payload.data.secondsWatched,
        completed: payload.data.completed,
        source: payload.data.source,
        viewerSessionId: getViewerSessionId({
          actor,
          explicitViewerSessionId: payload.data.viewerSessionId,
          fallbackPostId: postId,
        }),
      },
      actor,
    );

    if (!analytics) return fail('Feed post not found.', 404);
    return ok({ success: true, postId, analytics });
  } catch (error) {
    return feedRouteError(error);
  }
}
