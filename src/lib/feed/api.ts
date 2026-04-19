import { NextRequest } from 'next/server';
import { fail } from '@/lib/api-utils';
import { getApiUser } from '@/lib/auth-server';
import { isMissingFeedTableError } from '@/lib/feed/queries';
import { AppRole } from '@/lib/resurgence';

export type FeedActor = {
  id: string;
  role: AppRole;
  displayName: string;
};

export async function requireFeedActor(request: NextRequest) {
  const user = await getApiUser(request);
  if (!user) return { error: fail('Unauthorized. Please log in first.', 401), actor: null };

  return {
    error: null,
    actor: {
      id: user.id,
      role: user.role as AppRole,
      displayName: user.displayName,
    },
  };
}

export function feedRouteError(error: unknown) {
  if (isMissingFeedTableError(error)) {
    return fail('Feed tables are not migrated yet. Apply the creator-commerce feed migration first.', 503);
  }

  const message = error instanceof Error ? error.message : 'Feed request failed.';
  return fail(message, 400);
}
