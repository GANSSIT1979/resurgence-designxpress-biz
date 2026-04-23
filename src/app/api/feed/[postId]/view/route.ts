import { NextRequest } from 'next/server';
import { z } from 'zod';
import { fail, ok } from '@/lib/api-utils';
import { getViewerActor, getViewerSessionId } from '@/lib/feed-analytics/action-auth';
import { registerContentPostView } from '@/lib/feed-analytics/contentpost-analytics';
import { feedRouteError } from '@/lib/feed/api';

const bodySchema = z.object({
  viewerSessionId: z.string().trim().min(1).max(160).optional(),
  source: z.string().trim().max(80).optional(),
  surfacedAt: z.string().trim().max(80).optional(),
});

export async function POST(request: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;

  try {
    const payload = bodySchema.safeParse(await request.json().catch(() => ({})));
    if (!payload.success) return fail('Invalid view analytics payload.', 400);

    const actor = await getViewerActor(request);
    const analytics = await registerContentPostView(
      {
        postId,
        source: payload.data.source,
        surfacedAt: payload.data.surfacedAt,
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
