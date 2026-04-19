import { NextRequest } from 'next/server';
import { ok } from '@/lib/api-utils';
import { feedRouteError, requireFeedActor } from '@/lib/feed/api';
import { toggleCreatorFollow } from '@/lib/feed/mutations';

export async function POST(request: NextRequest, { params }: { params: Promise<{ creatorId: string }> }) {
  const { creatorId } = await params;
  const { actor, error } = await requireFeedActor(request);
  if (error || !actor) return error;

  try {
    return ok(await toggleCreatorFollow(actor, creatorId));
  } catch (routeError) {
    return feedRouteError(routeError);
  }
}
