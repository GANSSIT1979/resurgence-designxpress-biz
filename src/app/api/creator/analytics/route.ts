import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/api-utils';
import {
  canActorReadCreatorAnalytics,
  getCreatorAnalyticsTarget,
  requireCreatorAnalyticsActor,
} from '@/lib/creator-analytics-api/auth';
import { getCreatorAnalyticsApi } from '@/lib/creator-analytics-api/getCreatorAnalyticsApi';
import type { AnalyticsRangeKey } from '@/lib/creator-analytics/types';

export const runtime = 'nodejs';

function getRange(value: string | null): AnalyticsRangeKey {
  return value === '30d' ? '30d' : '7d';
}

export async function GET(request: NextRequest) {
  const { actor, error } = await requireCreatorAnalyticsActor(request);
  if (error || !actor) return error;

  const requestedCreatorId = request.nextUrl.searchParams.get('creatorId')?.trim() || '';
  const creatorId = requestedCreatorId || actor.creatorProfileId || '';
  const range = getRange(request.nextUrl.searchParams.get('range'));

  if (!creatorId) {
    return fail(
      actor.role === 'CREATOR'
        ? 'This creator account is not linked to a creator profile yet.'
        : 'Missing required query parameter: creatorId.',
      actor.role === 'CREATOR' ? 403 : 400,
    );
  }

  const { target, error: targetError } = await getCreatorAnalyticsTarget(creatorId);
  if (targetError || !target) return targetError;

  if (!canActorReadCreatorAnalytics(actor, target.id)) {
    return fail(
      'Forbidden. Creators may only read their own analytics unless they are staff or system admins.',
      403,
    );
  }

  try {
    const payload = await getCreatorAnalyticsApi(target.id, range);
    return ok({ data: payload });
  } catch (routeError) {
    console.error('[creator-analytics-api] Dashboard request failed.', routeError);
    return fail('Creator analytics request failed.', 500);
  }
}
