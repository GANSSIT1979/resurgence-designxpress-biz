import { NextRequest } from 'next/server';
import { fail, ok } from '@/lib/api-utils';
import {
  canActorReadSponsorSafeAnalytics,
  getCreatorAnalyticsTarget,
  requireSponsorSafeAnalyticsActor,
} from '@/lib/creator-analytics-api/auth';
import { buildSponsorSafeSummary } from '@/lib/creator-analytics-api/buildSponsorSafeSummary';
import { getCreatorAnalyticsApi } from '@/lib/creator-analytics-api/getCreatorAnalyticsApi';
import type { AnalyticsRangeKey } from '@/lib/creator-analytics/types';

export const runtime = 'nodejs';

function getRange(value: string | null): AnalyticsRangeKey {
  return value === '30d' ? '30d' : '7d';
}

export async function GET(request: NextRequest) {
  const { actor, error } = await requireSponsorSafeAnalyticsActor(request);
  if (error || !actor) return error;

  const creatorId = request.nextUrl.searchParams.get('creatorId')?.trim() || '';
  const range = getRange(request.nextUrl.searchParams.get('range'));

  if (!creatorId) {
    return fail('Missing required query parameter: creatorId.', 400);
  }

  const { target, error: targetError } = await getCreatorAnalyticsTarget(creatorId);
  if (targetError || !target) return targetError;

  if (!canActorReadSponsorSafeAnalytics(actor, target.id)) {
    return fail(
      'Forbidden. Sponsor-safe analytics are limited to your own creator profile or sponsor-facing roles.',
      403,
    );
  }

  try {
    const payload = await getCreatorAnalyticsApi(target.id, range);
    return ok({ data: buildSponsorSafeSummary(payload) });
  } catch (routeError) {
    console.error('[creator-analytics-api] Sponsor summary request failed.', routeError);
    return fail('Creator sponsor summary request failed.', 500);
  }
}
