import { prisma } from '@/lib/prisma';
import { createFeedPost } from '@/lib/feed/mutations';
import { getPostForApi } from '@/lib/feed/queries';
import { serializeContentPost } from '@/lib/feed/serializers';
import type { FeedActor } from '@/lib/feed/api';
import type { FeedPost } from '@/lib/feed/types';
import { canManageAnyFeedPost } from '@/lib/feed/authorization';

type ActionResult = { item: FeedPost | null } | { error: string };

function buildDuplicateTitle(post: FeedPost) {
  const base = post.title?.trim() || post.caption.trim().slice(0, 90) || 'Creator post';
  return base.endsWith('(Copy)') ? base : `${base} (Copy)`;
}

function buildDuplicateMeta(post: FeedPost) {
  return {
    ...(post.meta && typeof post.meta === 'object' ? post.meta : {}),
    duplicatedFromPostId: post.id,
  };
}

function cloneMediaAssets(post: FeedPost) {
  return post.mediaAssets.map((asset, index) => ({
    mediaType: asset.mediaType,
    url: asset.url,
    thumbnailUrl: asset.thumbnailUrl || '',
    originalFileName: asset.originalFileName || '',
    storageProvider: asset.storageProvider || '',
    storageKey: asset.storageKey || '',
    contentType: asset.contentType || '',
    size: asset.size ?? null,
    durationSeconds: asset.durationSeconds ?? null,
    metadata: asset.metadata || undefined,
    altText: asset.altText || '',
    caption: asset.caption || '',
    sortOrder: asset.sortOrder ?? index,
  }));
}

export async function getCreatorActionPost(postId: string) {
  const post = await getPostForApi(postId);
  if (!post || post.status === 'DELETED') return null;
  return post;
}

async function serializeActionPost(postId: string) {
  const post = await getCreatorActionPost(postId);
  return post ? serializeContentPost(post) : null;
}

export async function publishCreatorPost(actor: FeedActor, postId: string): Promise<ActionResult> {
  const nextStatus = canManageAnyFeedPost(actor.role) ? 'PUBLISHED' : 'PENDING_REVIEW';

  await prisma.contentPost.update({
    where: { id: postId },
    data: {
      status: nextStatus,
      archivedAt: null,
      publishedAt: nextStatus === 'PUBLISHED' ? new Date() : null,
    },
  });

  return { item: await serializeActionPost(postId) };
}

export async function unpublishCreatorPost(postId: string): Promise<ActionResult> {
  await prisma.contentPost.update({
    where: { id: postId },
    data: {
      status: 'DRAFT',
      archivedAt: null,
      publishedAt: null,
    },
  });

  return { item: await serializeActionPost(postId) };
}

export async function archiveCreatorPost(postId: string): Promise<ActionResult> {
  await prisma.contentPost.update({
    where: { id: postId },
    data: {
      status: 'ARCHIVED',
      archivedAt: new Date(),
    },
  });

  return { item: await serializeActionPost(postId) };
}

export async function duplicateCreatorPost(actor: FeedActor, sourcePostId: string): Promise<ActionResult> {
  const post = await getCreatorActionPost(sourcePostId);
  if (!post) return { error: 'Creator post not found.' };

  const source = serializeContentPost(post, actor.id);
  const result = await createFeedPost(actor, {
    creatorProfileId: source.creator?.id ?? undefined,
    title: buildDuplicateTitle(source),
    caption: source.caption,
    summary: source.summary ?? undefined,
    visibility: source.visibility,
    status: 'DRAFT',
    mediaAssets: cloneMediaAssets(source),
    hashtags: source.hashtags.map((tag) => tag.normalizedName),
    productIds: source.productTags.map((tag) => tag.productId).filter(Boolean),
    meta: buildDuplicateMeta(source),
  });

  if ('error' in result && result.error) return { error: result.error };
  return { item: result.item ?? null };
}

export async function deleteCreatorPost(postId: string) {
  await prisma.contentPost.update({
    where: { id: postId },
    data: {
      status: 'DELETED',
      archivedAt: new Date(),
    },
  });
}
