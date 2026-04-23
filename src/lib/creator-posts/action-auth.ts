import type { NextRequest } from 'next/server';
import { fail } from '@/lib/api-utils';
import { canCreateFeedPost, canManageAnyFeedPost } from '@/lib/feed/authorization';
import { requireFeedActor, type FeedActor } from '@/lib/feed/api';

export type CreatorActionActor = FeedActor;

type ActionablePostOwnership = {
  authorUserId?: string | null;
  creatorProfile?: {
    userId?: string | null;
  } | null;
};

export async function requireCreatorActionActor(request: NextRequest) {
  const { actor, error } = await requireFeedActor(request);
  if (error || !actor) {
    return { actor: null, error: error ?? fail('Unauthorized.', 401) };
  }

  if (!canCreateFeedPost(actor.role)) {
    return {
      actor: null,
      error: fail('Forbidden. Creator, staff, or admin access is required.', 403),
    };
  }

  return { actor, error: null };
}

export function canActorManageCreatorPost(
  actor: CreatorActionActor,
  post: ActionablePostOwnership | null | undefined,
) {
  if (!post) return false;
  if (canManageAnyFeedPost(actor.role)) return true;
  return post.authorUserId === actor.id || post.creatorProfile?.userId === actor.id;
}
