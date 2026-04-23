import { Prisma } from '@prisma/client';
import type {
  CreatorPostEditableRecord,
  CreatorPostEditPayload,
} from '@/lib/creator-posts/edit-types';
import {
  cleanHashtagLabel,
  normalizeHashtag,
} from '@/lib/feed/validation';
import { createFeedPost } from '@/lib/feed/mutations';
import { getPostForApi } from '@/lib/feed/queries';
import { serializeContentPost } from '@/lib/feed/serializers';
import { mapFeedPostToEditableRecord } from '@/lib/creator-posts/utils';
import type { FeedActor } from '@/lib/feed/api';
import type { FeedPost } from '@/lib/feed/types';
import { canManageAnyFeedPost } from '@/lib/feed/authorization';
import { prisma } from '@/lib/prisma';

type ActionResult = { item: FeedPost | null } | { error: string };
type EditResult = { post: CreatorPostEditableRecord | null } | { error: string };

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

function asRecord(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function uniqueStrings(values: string[] = []) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function normalizeNullableText(value: string | null | undefined, max = 4000) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, max) : null;
}

function toJsonValue(value: Record<string, unknown> | null | undefined) {
  if (!value || !Object.keys(value).length) return Prisma.DbNull;
  return value as Prisma.InputJsonValue;
}

function mergeEditablePostMeta(
  existing: Record<string, unknown> | null,
  next: Record<string, unknown> | undefined,
) {
  const protectedKeys = new Set([
    'source',
    'uploadEndpoint',
    'cloudflareVideoId',
    'customerCode',
    'duplicatedFromPostId',
  ]);

  const preserved = Object.fromEntries(
    Object.entries(existing || {}).filter(([key]) => protectedKeys.has(key)),
  );
  const merged = { ...preserved, ...(next || {}) };

  return Object.fromEntries(
    Object.entries(merged).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
}

function mergeEditableMediaMeta(
  existing: Record<string, unknown> | null,
  updates: Record<string, string | null | undefined>,
) {
  const merged: Record<string, unknown> = { ...(existing || {}) };

  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) continue;
    if (value === null || value === '') {
      delete merged[key];
      continue;
    }
    merged[key] = value;
  }

  return Object.fromEntries(
    Object.entries(merged).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  );
}

async function replaceHashtags(tx: Prisma.TransactionClient, postId: string, values: string[] = []) {
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

export async function getCreatorActionPost(postId: string) {
  const post = await getPostForApi(postId);
  if (!post || post.status === 'DELETED') return null;
  return post;
}

export async function getCreatorEditablePost(postId: string, viewerId?: string | null) {
  const post = await getPostForApi(postId);
  if (!post || post.status === 'DELETED') return null;
  return mapFeedPostToEditableRecord(serializeContentPost(post, viewerId));
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

export async function updateCreatorEditablePost(
  postId: string,
  payload: CreatorPostEditPayload,
  viewerId?: string | null,
): Promise<EditResult> {
  const existing = await prisma.contentPost.findUnique({
    where: { id: postId },
    include: {
      mediaAssets: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
    },
  });

  if (!existing || existing.status === 'DELETED') {
    return { error: 'Creator post not found.' };
  }

  const caption =
    payload.caption !== undefined
      ? normalizeNullableText(payload.caption, 2200)
      : undefined;
  if (payload.caption !== undefined && !caption) {
    return { error: 'Caption cannot be empty.' };
  }
  const nextCaption = caption ?? undefined;

  const postMeta =
    payload.meta !== undefined
      ? mergeEditablePostMeta(asRecord(existing.metadataJson), payload.meta)
      : undefined;

  await prisma.$transaction(async (tx) => {
    const postData: Prisma.ContentPostUpdateInput = {
      ...(payload.title !== undefined
        ? { title: normalizeNullableText(payload.title, 180) }
        : {}),
      ...(nextCaption !== undefined ? { caption: nextCaption } : {}),
      ...(payload.visibility !== undefined ? { visibility: payload.visibility } : {}),
      ...(postMeta !== undefined ? { metadataJson: toJsonValue(postMeta) } : {}),
    };

    if (Object.keys(postData).length) {
      await tx.contentPost.update({
        where: { id: postId },
        data: postData,
      });
    }

    if (payload.hashtags !== undefined) {
      await replaceHashtags(tx, postId, payload.hashtags);
    }

    const primaryMedia = existing.mediaAssets[0];
    if (!primaryMedia) return;

    const hasMediaChanges = [
      payload.posterUrl,
      payload.thumbnailUrl,
      payload.originalFileName,
      payload.durationSeconds,
      payload.aspectRatio,
      payload.altText,
      payload.locationLabel,
      payload.languageCode,
      payload.title,
    ].some((value) => value !== undefined);

    if (!hasMediaChanges) return;

    const nextTitle =
      payload.title !== undefined
        ? normalizeNullableText(payload.title, 180)
        : normalizeNullableText(existing.title, 180);
    const mediaMeta = mergeEditableMediaMeta(asRecord(primaryMedia.metadataJson), {
      posterUrl: normalizeNullableText(payload.posterUrl, 2048),
      aspectRatio: normalizeNullableText(payload.aspectRatio, 32),
      locationLabel: normalizeNullableText(payload.locationLabel, 255),
      languageCode: normalizeNullableText(payload.languageCode, 16),
      originalFileName: normalizeNullableText(payload.originalFileName, 255),
      title: nextTitle,
    });

    await tx.mediaAsset.update({
      where: { id: primaryMedia.id },
      data: {
        ...(payload.thumbnailUrl !== undefined
          ? { thumbnailUrl: normalizeNullableText(payload.thumbnailUrl, 2048) }
          : {}),
        ...(payload.originalFileName !== undefined
          ? { originalFileName: normalizeNullableText(payload.originalFileName, 255) }
          : {}),
        ...(payload.durationSeconds !== undefined
          ? {
              durationSeconds:
                payload.durationSeconds === null
                  ? null
                  : Math.max(0, Math.floor(payload.durationSeconds)),
            }
          : {}),
        ...(payload.altText !== undefined
          ? { altText: normalizeNullableText(payload.altText, 500) }
          : {}),
        metadataJson: toJsonValue(mediaMeta),
      },
    });
  });

  return { post: await getCreatorEditablePost(postId, viewerId) };
}
