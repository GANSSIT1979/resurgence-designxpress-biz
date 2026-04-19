import { NextRequest } from 'next/server';
import { ok } from '@/lib/api-utils';
import { feedRouteError } from '@/lib/feed/api';
import { getPromotedPlacements } from '@/lib/feed/queries';

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get('limit') || '4');

  try {
    return ok({ items: await getPromotedPlacements(limit) });
  } catch (error) {
    return feedRouteError(error);
  }
}
