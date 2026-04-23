import { Prisma, type ContentPostStatus, type ContentPostVisibility } from '@prisma/client';
import { z } from 'zod';
import { canManageAnyFeedPost } from '@/lib/feed/authorization';
import { feedCommentInputSchema } from '@/lib/feed/validation';
import { prisma } from '@/lib/prisma';
import type { CommentActor } from './action-auth';
import type {
  CommentPermissions,
  CommentStats,
  CommentTreeResponse,
  ContentPostCommentRecord,
} from './types';

const updateCommentInputSchema = z.object({
  body: z.string().trim().min(1).max(800),
});

const moderateCommentInputSchema = z.object({
  action: z.enum(['hide', 'unhide', 'remove']),
  reason: z
    .string()
    .trim()
    .max(240)
    .optional()
    .transform((value) => (value ? value : undefined)),
});

type CommentRow = Prisma.PostCommentGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        displayName: true;
        role: true;
      };
    };
  };
}>;

type ContentPostAccessRow = {
  id: string;
  status: ContentPostStatus;
  visibility: ContentPostVisibility;
  authorUserId: string | null;
  creatorProfile: {
    userId: string | null;
  } | null;
};

type DbClient = Prisma.TransactionClient | typeof prisma;

function normalizeStatus(isHidden: boolean): ContentPostCommentRecord['status'] {
  return isHidden ? 'HIDDEN' : 'VISIBLE';
}

function serializeComment(row: CommentRow, depth = 0): ContentPostCommentRecord {
  return {
    id: row.id,
    postId: row.postId,
    authorId: row.userId ?? null,
    parentId: row.parentCommentId ?? null,
    body: row.body,
    depth,
    status: normalizeStatus(row.isHidden),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    author: row.user
      ? {
          id: row.user.id,
          displayName: row.user.displayName ?? null,
          role: row.user.role ?? null,
        }
      : null,
    replies: [],
    replyCount: 0,
  };
}

function buildCommentTree(rows: CommentRow[]) {
  const map = new Map<string, ContentPostCommentRecord>();
  const roots: ContentPostCommentRecord[] = [];

  for (const row of rows) {
    map.set(row.id, serializeComment(row));
  }

  for (const row of rows) {
    const current = map.get(row.id);
    if (!current) continue;

    if (row.parentCommentId && map.has(row.parentCommentId)) {
      const parent = map.get(row.parentCommentId);
      if (!parent) continue;
      current.depth = parent.depth + 1;
      parent.replies.push(current);
      parent.replyCount += 1;
      continue;
    }

    roots.push(current);
  }

  return roots;
}

async function getPostAccess(postId: string) {
  return prisma.contentPost.findUnique({
    where: { id: postId },
    select: {
      id: true,
      status: true,
      visibility: true,
      authorUserId: true,
      creatorProfile: { select: { userId: true } },
    },
  });
}

function isPublicCommentablePost(post: ContentPostAccessRow | null) {
  return Boolean(post && post.status === 'PUBLISHED' && post.visibility === 'PUBLIC');
}

function canModerateComments(actor: CommentActor | null, post: ContentPostAccessRow | null) {
  if (!actor || !post) return false;
  if (canManageAnyFeedPost(actor.role)) return true;
  return post.authorUserId === actor.id || post.creatorProfile?.userId === actor.id;
}

async function getCommentStatsWithClient(client: DbClient, postId: string): Promise<CommentStats> {
  const [visibleCount, hiddenCount] = await Promise.all([
    client.postComment.count({
      where: {
        postId,
        isHidden: false,
      },
    }),
    client.postComment.count({
      where: {
        postId,
        isHidden: true,
      },
    }),
  ]);

  return {
    postId,
    totalCount: visibleCount + hiddenCount,
    visibleCount,
    hiddenCount,
  };
}

async function syncPostCommentCount(client: DbClient, postId: string) {
  const stats = await getCommentStatsWithClient(client, postId);
  await client.contentPost.update({
    where: { id: postId },
    data: { commentCount: stats.visibleCount },
  });
  return stats;
}

function buildPermissions(actor: CommentActor | null, post: ContentPostAccessRow | null): CommentPermissions {
  return {
    canComment: Boolean(actor && post && isPublicCommentablePost(post)),
    canModerate: canModerateComments(actor, post),
  };
}

export async function listContentPostComments(postId: string, actor: CommentActor | null): Promise<CommentTreeResponse | null> {
  const post = await getPostAccess(postId);
  if (!isPublicCommentablePost(post)) return null;

  const permissions = buildPermissions(actor, post);
  const [rows, stats] = await Promise.all([
    prisma.postComment.findMany({
      where: {
        postId,
        ...(permissions.canModerate ? {} : { isHidden: false }),
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            role: true,
          },
        },
      },
      orderBy: [{ createdAt: 'asc' }],
    }),
    getCommentStatsWithClient(prisma, postId),
  ]);

  return {
    postId,
    totalCount: permissions.canModerate ? stats.totalCount : stats.visibleCount,
    visibleCount: stats.visibleCount,
    hiddenCount: permissions.canModerate ? stats.hiddenCount : 0,
    comments: buildCommentTree(rows),
    permissions,
  };
}

export async function getContentPostCommentStats(postId: string): Promise<CommentStats | null> {
  const post = await getPostAccess(postId);
  if (!isPublicCommentablePost(post)) return null;
  return getCommentStatsWithClient(prisma, postId);
}

export async function createContentPostComment(actor: CommentActor, postId: string, body: unknown) {
  const parsed = feedCommentInputSchema.safeParse(body);
  if (!parsed.success) return { error: 'Comment must be between 1 and 800 characters.' };

  const post = await getPostAccess(postId);
  if (!isPublicCommentablePost(post)) return { error: 'Comments are not available for this post.' };

  if (parsed.data.parentCommentId) {
    const parent = await prisma.postComment.findFirst({
      where: {
        id: parsed.data.parentCommentId,
        postId,
      },
      select: { id: true },
    });

    if (!parent) {
      return { error: 'Reply target not found.' };
    }
  }

  const result = await prisma.$transaction(async (tx) => {
    const created = await tx.postComment.create({
      data: {
        postId,
        userId: actor.id,
        parentCommentId: parsed.data.parentCommentId || null,
        body: parsed.data.body,
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            role: true,
          },
        },
      },
    });

    const stats = await syncPostCommentCount(tx, postId);
    return { created, stats };
  });

  return {
    comment: serializeComment(result.created),
    stats: result.stats,
  };
}

async function getCommentWithAccess(postId: string, commentId: string, actor: CommentActor | null) {
  const post = await getPostAccess(postId);
  if (!isPublicCommentablePost(post)) return { error: 'Comments are not available for this post.', post: null, comment: null };

  const comment = await prisma.postComment.findFirst({
    where: {
      id: commentId,
      postId,
    },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          role: true,
        },
      },
    },
  });

  if (!comment) {
    return { error: 'Comment not found.', post, comment: null };
  }

  return { error: null, post, comment };
}

export async function updateContentPostComment(actor: CommentActor, postId: string, commentId: string, body: unknown) {
  const parsed = updateCommentInputSchema.safeParse(body);
  if (!parsed.success) return { error: 'Comment must be between 1 and 800 characters.' };

  const { error, comment } = await getCommentWithAccess(postId, commentId, actor);
  if (error || !comment) return { error: error || 'Comment not found.' };

  if (!comment.userId || comment.userId !== actor.id) {
    return { error: 'Only the comment author can edit this comment.' };
  }

  const updated = await prisma.postComment.update({
    where: { id: comment.id },
    data: {
      body: parsed.data.body,
      isHidden: false,
    },
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          role: true,
        },
      },
    },
  });

  return { comment: serializeComment(updated) };
}

export async function deleteContentPostComment(actor: CommentActor, postId: string, commentId: string) {
  const access = await getCommentWithAccess(postId, commentId, actor);
  if (access.error || !access.comment || !access.post) {
    return { error: access.error || 'Comment not found.' };
  }

  const canModerate = canModerateComments(actor, access.post);
  if (access.comment.userId !== actor.id && !canModerate) {
    return { error: 'You do not have permission to remove this comment.' };
  }

  const previousParentId = access.comment.parentCommentId ?? null;

  const stats = await prisma.$transaction(async (tx) => {
    await tx.postComment.updateMany({
      where: { parentCommentId: access.comment!.id },
      data: { parentCommentId: previousParentId },
    });

    await tx.postComment.delete({ where: { id: access.comment!.id } });
    return syncPostCommentCount(tx, postId);
  });

  return {
    comment: {
      ...serializeComment(access.comment),
      parentId: previousParentId,
      status: 'REMOVED' as const,
    },
    stats,
  };
}

export async function moderateContentPostComment(actor: CommentActor, postId: string, commentId: string, body: unknown) {
  const parsed = moderateCommentInputSchema.safeParse(body);
  if (!parsed.success) return { error: 'Invalid moderation request.' };

  const access = await getCommentWithAccess(postId, commentId, actor);
  if (access.error || !access.comment || !access.post) {
    return { error: access.error || 'Comment not found.' };
  }

  if (!canModerateComments(actor, access.post)) {
    return { error: 'Only the creator owner, staff, or admin can moderate comments on this post.' };
  }

  if (parsed.data.action === 'remove') {
    return deleteContentPostComment(actor, postId, commentId);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const row = await tx.postComment.update({
      where: { id: access.comment!.id },
      data: {
        isHidden: parsed.data.action === 'hide',
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            role: true,
          },
        },
      },
    });

    const stats = await syncPostCommentCount(tx, postId);
    return { row, stats };
  });

  return {
    comment: serializeComment(updated.row),
    stats: updated.stats,
  };
}
