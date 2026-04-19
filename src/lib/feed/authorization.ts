import { prisma } from '@/lib/prisma';
import { AppRole } from '@/lib/resurgence';

const feedManagerRoles = new Set<AppRole>(['SYSTEM_ADMIN', 'STAFF']);
const feedCreatorRoles = new Set<AppRole>(['SYSTEM_ADMIN', 'STAFF', 'CREATOR']);

export function canManageAnyFeedPost(role: AppRole) {
  return feedManagerRoles.has(role);
}

export function canCreateFeedPost(role: AppRole) {
  return feedCreatorRoles.has(role);
}

export async function canManageFeedPost(user: { id: string; role: AppRole }, postId: string) {
  if (canManageAnyFeedPost(user.role)) return true;

  const post = await prisma.contentPost.findUnique({
    where: { id: postId },
    select: {
      authorUserId: true,
      creatorProfile: { select: { userId: true } },
    },
  });

  if (!post) return false;
  return post.authorUserId === user.id || post.creatorProfile?.userId === user.id;
}
