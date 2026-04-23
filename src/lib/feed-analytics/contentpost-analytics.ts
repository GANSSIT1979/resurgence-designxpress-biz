import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type {
  AnalyticsSnapshot,
  RegisterViewInput,
  RegisterWatchTimeInput,
  ViewerActor,
} from './types';
import { extractAnalyticsSnapshot, getAnalyticsMeta } from './types';

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as JsonRecord;
}

function toSafeCount(value: unknown) {
  return Number.isFinite(value) ? Math.max(0, Math.round(Number(value))) : 0;
}

function toStringArray(value: unknown, limit = 500) {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
        .filter(Boolean),
    ),
  ).slice(-limit);
}

function toJsonValue(value: JsonRecord): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

async function getPublicAnalyticsPost(postId: string) {
  return prisma.contentPost.findFirst({
    where: {
      id: postId,
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
    },
    select: {
      id: true,
      authorUserId: true,
      creatorProfileId: true,
      viewCount: true,
      likeCount: true,
      saveCount: true,
      shareCount: true,
      commentCount: true,
      metadataJson: true,
    },
  });
}

function buildMetadataUpdate(post: {
  metadataJson: unknown;
  viewCount: number;
  likeCount: number;
  saveCount: number;
  shareCount: number;
  commentCount: number;
}, patch: {
  addView?: boolean;
  addWatchTimeSeconds?: number;
  viewerSessionId?: string | null;
  completed?: boolean;
}) {
  const root = asRecord(post.metadataJson);
  const analytics = getAnalyticsMeta(post.metadataJson);
  const viewerSessionIds = toStringArray(analytics.viewerSessionIds);
  const completedViewerSessionIds = toStringArray(analytics.completedViewerSessionIds);
  const nowIso = new Date().toISOString();

  const addUniqueView =
    Boolean(patch.addView) &&
    Boolean(patch.viewerSessionId) &&
    !viewerSessionIds.includes(String(patch.viewerSessionId));

  const addCompletedView =
    Boolean(patch.completed) &&
    Boolean(patch.viewerSessionId) &&
    !completedViewerSessionIds.includes(String(patch.viewerSessionId));

  const nextViewerSessionIds = addUniqueView
    ? [...viewerSessionIds, String(patch.viewerSessionId)].slice(-500)
    : viewerSessionIds;

  const nextCompletedViewerSessionIds = addCompletedView
    ? [...completedViewerSessionIds, String(patch.viewerSessionId)].slice(-500)
    : completedViewerSessionIds;

  const nextViewCount = toSafeCount(post.viewCount) + (patch.addView ? 1 : 0);
  const nextUniqueViewCount = toSafeCount(analytics.uniqueViewCount) + (addUniqueView ? 1 : 0);
  const nextWatchTimeSeconds = toSafeCount(analytics.watchTimeSeconds) + toSafeCount(patch.addWatchTimeSeconds);
  const nextCompletedViewCount = toSafeCount(analytics.completedViewCount) + (addCompletedView ? 1 : 0);

  const metadataJson = toJsonValue({
    ...root,
    analytics: {
      ...analytics,
      viewCount: nextViewCount,
      uniqueViewCount: nextUniqueViewCount,
      watchTimeSeconds: nextWatchTimeSeconds,
      completedViewCount: nextCompletedViewCount,
      viewerSessionIds: nextViewerSessionIds,
      completedViewerSessionIds: nextCompletedViewerSessionIds,
      lastViewedAt: nowIso,
    },
  });

  return {
    viewCount: nextViewCount,
    metadataJson,
  };
}

function buildSnapshot(record: {
  viewCount: number;
  likeCount: number;
  saveCount: number;
  shareCount: number;
  commentCount: number;
  metadataJson: unknown;
}): AnalyticsSnapshot {
  return extractAnalyticsSnapshot({
    viewCount: record.viewCount,
    likeCount: record.likeCount,
    saveCount: record.saveCount,
    shareCount: record.shareCount,
    commentCount: record.commentCount,
    metadataJson: record.metadataJson,
  });
}

export async function getContentPostAnalyticsSnapshot(postId: string) {
  const post = await getPublicAnalyticsPost(postId);
  if (!post) return null;
  return buildSnapshot(post);
}

export async function registerContentPostView(input: RegisterViewInput, _actor: ViewerActor) {
  const post = await getPublicAnalyticsPost(input.postId);
  if (!post) return null;

  const updated = await prisma.contentPost.update({
    where: { id: post.id },
    data: buildMetadataUpdate(post, {
      addView: true,
      viewerSessionId: input.viewerSessionId,
    }),
    select: {
      viewCount: true,
      likeCount: true,
      saveCount: true,
      shareCount: true,
      commentCount: true,
      metadataJson: true,
    },
  });

  return buildSnapshot(updated);
}

export async function registerContentPostWatchTime(input: RegisterWatchTimeInput, _actor: ViewerActor) {
  const post = await getPublicAnalyticsPost(input.postId);
  if (!post) return null;

  const safeSeconds = Math.max(0, Math.min(300, Math.round(input.secondsWatched || 0)));
  const updated = await prisma.contentPost.update({
    where: { id: post.id },
    data: {
      metadataJson: buildMetadataUpdate(post, {
        addWatchTimeSeconds: safeSeconds,
        completed: Boolean(input.completed),
        viewerSessionId: input.viewerSessionId,
      }).metadataJson,
    },
    select: {
      viewCount: true,
      likeCount: true,
      saveCount: true,
      shareCount: true,
      commentCount: true,
      metadataJson: true,
    },
  });

  return buildSnapshot(updated);
}
