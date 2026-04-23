import { Prisma } from '@prisma/client';
import type { ContentPostStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { AppRole } from '@/lib/resurgence';
import { canManageAnyFeedPost } from '@/lib/feed/authorization';
import { FeedActor } from '@/lib/feed/api';
import { getPostForApi } from '@/lib/feed/queries';
import { serializeContentPost } from '@/lib/feed/serializers';
import {
  cleanHashtagLabel,
  feedCommentInputSchema,
  feedPostInputSchema,
  feedPostPatchSchema,
  feedProductTagInputSchema,
  normalizeHashtag,
} from '@/lib/feed/validation';

function nullableText(value?: string | null) {
  const text = value?.trim();
  return text ? text : null;
}

function uniqueStrings(values: string[] = []) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function nullableObject(value?: Record<string, unknown> | null) {
  if (value === null) return Prisma.DbNull;
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  return Object.keys(value).length ? (value as Prisma.InputJsonValue) : undefined;
}

function resolvePostStatus(requested: string | undefined, role: AppRole): ContentPostStatus {
  if (canManageAnyFeedPost(role)) return (requested || 'PUBLISHED') as ContentPostStatus;
  if (requested === 'PUBLISHED') return 'PENDING_REVIEW';
  if (requested === 'HIDDEN' || requested === 'ARCHIVED') return 'DRAFT';
  return (requested || 'PENDING_REVIEW') as ContentPostStatus;
}

async function resolveCreatorProfileId(actor: FeedActor, requestedCreatorProfileId?: string | null) {
  if (canManageAnyFeedPost(actor.role)) return nullableText(requestedCreatorProfileId);
  if (actor.role !== 'CREATOR') return null;

  const creator = await prisma.creatorProfile.findUnique({
    where: { userId: actor.id },
    select: { id: true },
  });

  return creator?.id ?? null;
}

async function replaceHashtags(tx: any, postId: string, values: string[] = []) {
  await tx.postHashtag.deleteMany({ where: { postId } });

  const normalized = uniqueStrings(values.map(normalizeHashtag)).filter(Boolean).slice(0, 12);
  for (const name of normalized) {
    const hashtag = await tx.hashtag.upsert({
      where: { normalizedName: name },
      update: { label: cleanHashtagLabel(name) },
      create: { normalizedName: name, label: cleanHashtagLabel(name) },
    });

    await tx.postHashtag.create({ data: { postId, hashtagId: hashtag.id } });
  }
}

async function replaceProductTags(tx: any, postId: string, productIds: string[] = []) {
  await tx.postProductTag.deleteMany({ where: { postId } });

  const ids = uniqueStrings(productIds).slice(0, 8);
  if (!ids.length) return;

  const products = await tx.shopProduct.findMany({
    where: { id: { in: ids }, isActive: true },
    select: { id: true, name: true },
  });
  const productMap = new Map(products.map((product: { id: string; name: string }) => [product.id, product.name]));

  for (const [index, productId] of ids.entries()) {
    if (!productMap.has(productId)) continue;
    await tx.postProductTag.create({
      data: {
        postId,
        productId,
        label: productMap.get(productId),
        ctaLabel: 'Shop merch',
        sortOrder: index,
      },
    });
  }
}

async function replaceMediaAssets(tx: any, postId: string, mediaAssets: any[]) {
  await tx.mediaAsset.deleteMany({ where: { postId } });

  for (const [index, asset] of mediaAssets.entries()) {
    if (!asset.url) continue;
    await tx.mediaAsset.create({
      data: {
        postId,
        mediaType: asset.mediaType,
        url: asset.url,
        thumbnailUrl: nullableText(asset.thumbnailUrl),
        originalFileName: nullableText(asset.originalFileName),
        storageProvider: nullableText(asset.storageProvider),
        storageKey: nullableText(asset.storageKey),
        contentType: nullableText(asset.contentType),
        size: Number.isFinite(asset.size) ? Math.max(0, Math.floor(asset.size)) : null,
        durationSeconds: Number.isFinite(asset.durationSeconds)
          ? Math.max(0, Math.floor(asset.durationSeconds))
          : null,
        altText: nullableText(asset.altText),
        caption: nullableText(asset.caption),
        metadataJson:
          asset.metadata && typeof asset.metadata === 'object' && !Array.isArray(asset.metadata)
            ? asset.metadata
            : null,
        sortOrder: asset.sortOrder ?? index,
      },
    });
  }
}

export async function createFeedPost(actor: FeedActor, body: unknown) {
  const parsed = feedPostInputSchema.safeParse(body);
  if (!parsed.success) return { error: 'Invalid feed post payload. Add a caption and at least one valid media item.' };

  const creatorProfileId = await resolveCreatorProfileId(actor, parsed.data.creatorProfileId);
  if (actor.role === 'CREATOR' && !creatorProfileId) {
    return { error: 'Your creator account is not linked to a creator profile yet.' };
  }

  const status = resolvePostStatus(parsed.data.status, actor.role);
  const post = await prisma.$transaction(async (tx) => {
    const created = await tx.contentPost.create({
      data: {
        authorUserId: actor.id,
        creatorProfileId,
        title: nullableText(parsed.data.title),
        caption: parsed.data.caption,
        summary: nullableText(parsed.data.summary),
        slug: nullableText(parsed.data.slug),
        visibility: parsed.data.visibility,
        status,
        isFeatured: canManageAnyFeedPost(actor.role) ? parsed.data.isFeatured : false,
        isPinned: canManageAnyFeedPost(actor.role) ? parsed.data.isPinned : false,
        metadataJson: nullableObject(parsed.data.meta),
        publishedAt: status === 'PUBLISHED' ? new Date() : null,
      },
    });

    await replaceMediaAssets(tx, created.id, parsed.data.mediaAssets);
    await replaceHashtags(tx, created.id, parsed.data.hashtags);
    await replaceProductTags(tx, created.id, parsed.data.productIds);
    return created;
  });

  const fullPost = await getPostForApi(post.id);
  return { item: fullPost ? serializeContentPost(fullPost, actor.id) : null };
}

export async function updateFeedPost(actor: FeedActor, postId: string, body: unknown) {
  const parsed = feedPostPatchSchema.safeParse(body);
  if (!parsed.success) return { error: 'Invalid feed post update payload.' };

  const status = parsed.data.status ? resolvePostStatus(parsed.data.status, actor.role) : undefined;

  await prisma.$transaction(async (tx) => {
    await tx.contentPost.update({
      where: { id: postId },
      data: {
        ...(parsed.data.title !== undefined ? { title: nullableText(parsed.data.title) } : {}),
        ...(parsed.data.caption !== undefined ? { caption: parsed.data.caption } : {}),
        ...(parsed.data.summary !== undefined ? { summary: nullableText(parsed.data.summary) } : {}),
        ...(parsed.data.slug !== undefined ? { slug: nullableText(parsed.data.slug) } : {}),
        ...(parsed.data.meta !== undefined ? { metadataJson: nullableObject(parsed.data.meta) } : {}),
        ...(parsed.data.visibility !== undefined ? { visibility: parsed.data.visibility } : {}),
        ...(status ? { status } : {}),
        ...(status === 'PUBLISHED' ? { publishedAt: new Date(), archivedAt: null } : {}),
        ...(status === 'ARCHIVED' ? { archivedAt: new Date() } : {}),
        ...(canManageAnyFeedPost(actor.role) && parsed.data.isFeatured !== undefined ? { isFeatured: parsed.data.isFeatured } : {}),
        ...(canManageAnyFeedPost(actor.role) && parsed.data.isPinned !== undefined ? { isPinned: parsed.data.isPinned } : {}),
      },
    });

    if (parsed.data.mediaAssets) await replaceMediaAssets(tx, postId, parsed.data.mediaAssets);
    if (parsed.data.hashtags) await replaceHashtags(tx, postId, parsed.data.hashtags);
    if (parsed.data.productIds) await replaceProductTags(tx, postId, parsed.data.productIds);
  });

  const fullPost = await getPostForApi(postId);
  return { item: fullPost ? serializeContentPost(fullPost, actor.id) : null };
}

export async function softDeleteFeedPost(postId: string) {
  await prisma.contentPost.update({
    where: { id: postId },
    data: { status: 'DELETED', archivedAt: new Date() },
  });
  return { success: true };
}

export async function togglePostLike(actor: FeedActor, postId: string) {
  const existing = await prisma.postLike.findUnique({ where: { postId_userId: { postId, userId: actor.id } } });

  return prisma.$transaction(async (tx) => {
    if (existing) {
      await tx.postLike.delete({ where: { id: existing.id } });
      const post = await tx.contentPost.update({ where: { id: postId }, data: { likeCount: { decrement: 1 } }, select: { likeCount: true } });
      return { liked: false, likeCount: Math.max(0, post.likeCount) };
    }

    await tx.postLike.create({ data: { postId, userId: actor.id } });
    const post = await tx.contentPost.update({ where: { id: postId }, data: { likeCount: { increment: 1 } }, select: { likeCount: true } });
    return { liked: true, likeCount: post.likeCount };
  });
}

export async function createPostComment(actor: FeedActor, postId: string, body: unknown) {
  const parsed = feedCommentInputSchema.safeParse(body);
  if (!parsed.success) return { error: 'Comment must be between 1 and 800 characters.' };

  const comment = await prisma.$transaction(async (tx) => {
    const created = await tx.postComment.create({
      data: {
        postId,
        userId: actor.id,
        parentCommentId: nullableText(parsed.data.parentCommentId),
        body: parsed.data.body,
      },
      include: { user: { select: { id: true, displayName: true, role: true } } },
    });

    await tx.contentPost.update({ where: { id: postId }, data: { commentCount: { increment: 1 } } });
    return created;
  });

  return {
    item: {
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt.toISOString(),
      author: comment.user,
    },
  };
}

export async function togglePostSave(actor: FeedActor, postId: string) {
  const existing = await prisma.postSave.findUnique({ where: { postId_userId: { postId, userId: actor.id } } });

  return prisma.$transaction(async (tx) => {
    if (existing) {
      await tx.postSave.delete({ where: { id: existing.id } });
      const post = await tx.contentPost.update({ where: { id: postId }, data: { saveCount: { decrement: 1 } }, select: { saveCount: true } });
      return { saved: false, saveCount: Math.max(0, post.saveCount) };
    }

    await tx.postSave.create({ data: { postId, userId: actor.id } });
    const post = await tx.contentPost.update({ where: { id: postId }, data: { saveCount: { increment: 1 } }, select: { saveCount: true } });
    return { saved: true, saveCount: post.saveCount };
  });
}

export async function incrementPublicPostShare(postId: string) {
  const item = await prisma.contentPost.findFirst({
    where: {
      id: postId,
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
    },
    select: { id: true },
  });

  if (!item) return null;

  const updated = await prisma.contentPost.update({
    where: { id: item.id },
    data: { shareCount: { increment: 1 } },
    select: { shareCount: true },
  });

  return { shareCount: updated.shareCount };
}

export async function toggleCreatorFollow(actor: FeedActor, creatorProfileId: string) {
  const existing = await prisma.follow.findUnique({
    where: { followerUserId_creatorProfileId: { followerUserId: actor.id, creatorProfileId } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return { following: false };
  }

  await prisma.follow.create({ data: { followerUserId: actor.id, creatorProfileId } });
  return { following: true };
}

export async function replacePostProducts(postId: string, body: unknown) {
  const parsed = feedProductTagInputSchema.safeParse(body);
  if (!parsed.success) return { error: 'Invalid product tag payload.' };

  await prisma.$transaction(async (tx) => {
    await replaceProductTags(tx, postId, parsed.data.productIds);
  });

  const fullPost = await getPostForApi(postId);
  return { item: fullPost ? serializeContentPost(fullPost) : null };
}
