import { ContentViewSource, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type {
  AnalyticsSnapshot,
  RegisterViewInput,
  RegisterWatchTimeInput,
  ViewerActor,
} from './types';
import {
  extractAnalyticsCounterState,
  extractAnalyticsSnapshot,
  getAnalyticsMeta,
} from './types';

type JsonRecord = Record<string, unknown>;

type AnalyticsPostRecord = {
  id: string;
  authorUserId: string | null;
  creatorProfileId: string | null;
  viewCount: number;
  uniqueViewCount: number;
  watchTimeSeconds: number;
  completedViewCount: number;
  avgWatchTimeSeconds: number;
  completionRate: number;
  likeCount: number;
  saveCount: number;
  shareCount: number;
  commentCount: number;
  firstViewedAt: Date | null;
  lastViewedAt: Date | null;
  metadataJson: unknown;
};

function asRecord(value: unknown): JsonRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  return value as JsonRecord;
}

function toSafeCount(value: unknown) {
  return Number.isFinite(value) ? Math.max(0, Math.round(Number(value))) : 0;
}

function toDate(value: unknown) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value !== 'string') return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toIsoString(value: Date | null) {
  return value ? value.toISOString() : null;
}

function toJsonValue(value: JsonRecord) {
  return value as Prisma.InputJsonValue;
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

function hashValue(raw: string) {
  let hash = 0;
  for (let index = 0; index < raw.length; index += 1) {
    hash = (hash * 31 + raw.charCodeAt(index)) | 0;
  }
  return `vh_${Math.abs(hash)}`;
}

function normalizeViewerSessionKey(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, 160) : null;
}

function buildViewerDeviceHash(actor: ViewerActor) {
  const raw = [actor.ip || 'no-ip', actor.userAgent || 'no-ua'].join('|');
  if (!raw.replace(/\|/g, '').trim()) return null;
  return hashValue(raw.slice(0, 500));
}

function mapContentViewSource(value?: string | null): ContentViewSource {
  const normalized = value?.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '_');

  switch (normalized) {
    case 'FEED':
      return ContentViewSource.FEED;
    case 'PROFILE':
      return ContentViewSource.PROFILE;
    case 'PRODUCT':
      return ContentViewSource.PRODUCT;
    case 'DIRECT_LINK':
      return ContentViewSource.DIRECT_LINK;
    case 'EMBED':
      return ContentViewSource.EMBED;
    default:
      return ContentViewSource.UNKNOWN;
  }
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
      uniqueViewCount: true,
      watchTimeSeconds: true,
      completedViewCount: true,
      avgWatchTimeSeconds: true,
      completionRate: true,
      likeCount: true,
      saveCount: true,
      shareCount: true,
      commentCount: true,
      firstViewedAt: true,
      lastViewedAt: true,
      metadataJson: true,
    },
  });
}

type AnalyticsMutationPatch = {
  addViewCount?: number;
  addUniqueViewCount?: number;
  addWatchTimeSeconds?: number;
  addCompletedViewCount?: number;
  viewerSessionId?: string | null;
  firstViewedAt?: Date | null;
  lastViewedAt?: Date | null;
};

function buildAnalyticsMutationState(post: AnalyticsPostRecord, patch: AnalyticsMutationPatch) {
  const root = asRecord(post.metadataJson);
  const analytics = getAnalyticsMeta(post.metadataJson);
  const counters = extractAnalyticsCounterState({
    viewCount: post.viewCount,
    uniqueViewCount: post.uniqueViewCount,
    watchTimeSeconds: post.watchTimeSeconds,
    completedViewCount: post.completedViewCount,
    avgWatchTimeSeconds: post.avgWatchTimeSeconds,
    completionRate: post.completionRate,
    firstViewedAt: post.firstViewedAt?.toISOString(),
    lastViewedAt: post.lastViewedAt?.toISOString(),
    metadataJson: post.metadataJson,
  });
  const viewerSessionIds = toStringArray(analytics.viewerSessionIds);
  const completedViewerSessionIds = toStringArray(analytics.completedViewerSessionIds);
  const viewerSessionId = normalizeViewerSessionKey(patch.viewerSessionId);
  const canAddUniqueView =
    toSafeCount(patch.addUniqueViewCount) > 0 &&
    (!viewerSessionId || !viewerSessionIds.includes(viewerSessionId));
  const canAddCompletedView =
    toSafeCount(patch.addCompletedViewCount) > 0 &&
    (!viewerSessionId || !completedViewerSessionIds.includes(viewerSessionId));
  const nextViewCount = counters.viewCount + toSafeCount(patch.addViewCount);
  const nextUniqueViewCount = counters.uniqueViewCount + (canAddUniqueView ? 1 : 0);
  const nextWatchTimeSeconds = counters.watchTimeSeconds + toSafeCount(patch.addWatchTimeSeconds);
  const nextCompletedViewCount = counters.completedViewCount + (canAddCompletedView ? 1 : 0);
  const nextAverageWatchTimeSeconds =
    nextViewCount > 0 ? Math.round((nextWatchTimeSeconds / nextViewCount) * 100) / 100 : 0;
  const nextCompletionRate =
    nextViewCount > 0 ? Math.round(((nextCompletedViewCount / nextViewCount) * 100) * 100) / 100 : 0;
  const nextFirstViewedAt =
    toDate(post.firstViewedAt) ||
    toDate(counters.firstViewedAt) ||
    patch.firstViewedAt ||
    patch.lastViewedAt ||
    null;
  const nextLastViewedAt = patch.lastViewedAt || toDate(post.lastViewedAt) || toDate(counters.lastViewedAt) || null;
  const nextViewerSessionIds =
    canAddUniqueView && viewerSessionId
      ? [...viewerSessionIds, viewerSessionId].slice(-500)
      : viewerSessionIds;
  const nextCompletedViewerSessionIds =
    canAddCompletedView && viewerSessionId
      ? [...completedViewerSessionIds, viewerSessionId].slice(-500)
      : completedViewerSessionIds;

  return {
    increments: {
      viewCount: toSafeCount(patch.addViewCount),
      uniqueViewCount: canAddUniqueView ? 1 : 0,
      watchTimeSeconds: toSafeCount(patch.addWatchTimeSeconds),
      completedViewCount: canAddCompletedView ? 1 : 0,
    },
    next: {
      viewCount: nextViewCount,
      uniqueViewCount: nextUniqueViewCount,
      watchTimeSeconds: nextWatchTimeSeconds,
      completedViewCount: nextCompletedViewCount,
      averageWatchTimeSeconds: nextAverageWatchTimeSeconds,
      completionRate: nextCompletionRate,
      firstViewedAt: nextFirstViewedAt,
      lastViewedAt: nextLastViewedAt,
    },
    metadataJson: toJsonValue({
      ...root,
      analytics: {
        ...analytics,
        viewCount: nextViewCount,
        uniqueViewCount: nextUniqueViewCount,
        watchTimeSeconds: nextWatchTimeSeconds,
        completedViewCount: nextCompletedViewCount,
        avgWatchTimeSeconds: nextAverageWatchTimeSeconds,
        completionRate: nextCompletionRate,
        viewerSessionIds: nextViewerSessionIds,
        completedViewerSessionIds: nextCompletedViewerSessionIds,
        firstViewedAt: toIsoString(nextFirstViewedAt),
        lastViewedAt: toIsoString(nextLastViewedAt),
      },
    }),
  };
}

function buildSnapshot(record: {
  viewCount: number;
  uniqueViewCount: number;
  watchTimeSeconds: number;
  completedViewCount: number;
  avgWatchTimeSeconds: number;
  completionRate: number;
  likeCount: number;
  saveCount: number;
  shareCount: number;
  commentCount: number;
  firstViewedAt?: Date | null;
  lastViewedAt?: Date | null;
  metadataJson: unknown;
}): AnalyticsSnapshot {
  return extractAnalyticsSnapshot({
    viewCount: record.viewCount,
    uniqueViewCount: record.uniqueViewCount,
    watchTimeSeconds: record.watchTimeSeconds,
    completedViewCount: record.completedViewCount,
    avgWatchTimeSeconds: record.avgWatchTimeSeconds,
    completionRate: record.completionRate,
    likeCount: record.likeCount,
    saveCount: record.saveCount,
    shareCount: record.shareCount,
    commentCount: record.commentCount,
    firstViewedAt: record.firstViewedAt?.toISOString(),
    lastViewedAt: record.lastViewedAt?.toISOString(),
    metadataJson: record.metadataJson,
  });
}

async function findExistingSession(
  tx: Prisma.TransactionClient,
  {
    postId,
    viewerSessionKey,
    viewerUserId,
    deviceHash,
  }: {
    postId: string;
    viewerSessionKey?: string | null;
    viewerUserId?: string | null;
    deviceHash?: string | null;
  },
) {
  if (viewerSessionKey) {
    return tx.contentPostViewSession.findFirst({
      where: {
        contentPostId: postId,
        viewerSessionKey,
      },
      orderBy: { lastViewedAt: 'desc' },
      select: {
        id: true,
        completedViewCount: true,
      },
    });
  }

  if (viewerUserId) {
    return tx.contentPostViewSession.findFirst({
      where: {
        contentPostId: postId,
        viewerUserId,
      },
      orderBy: { lastViewedAt: 'desc' },
      select: {
        id: true,
        completedViewCount: true,
      },
    });
  }

  if (deviceHash) {
    return tx.contentPostViewSession.findFirst({
      where: {
        contentPostId: postId,
        deviceHash,
      },
      orderBy: { lastViewedAt: 'desc' },
      select: {
        id: true,
        completedViewCount: true,
      },
    });
  }

  return null;
}

export async function getContentPostAnalyticsSnapshot(postId: string) {
  const post = await getPublicAnalyticsPost(postId);
  if (!post) return null;
  return buildSnapshot(post);
}

export async function registerContentPostView(input: RegisterViewInput, actor: ViewerActor) {
  const post = await getPublicAnalyticsPost(input.postId);
  if (!post) return null;

  const viewerSessionKey = normalizeViewerSessionKey(input.viewerSessionId);
  const deviceHash = buildViewerDeviceHash(actor);
  const viewedAt = new Date();
  const source = mapContentViewSource(input.source);

  const updated = await prisma.$transaction(async (tx) => {
    const existingSession = await findExistingSession(tx, {
      postId: post.id,
      viewerSessionKey,
      viewerUserId: actor.userId,
      deviceHash,
    });
    const nextState = buildAnalyticsMutationState(post, {
      addViewCount: 1,
      addUniqueViewCount: existingSession ? 0 : 1,
      viewerSessionId: viewerSessionKey,
      firstViewedAt: viewedAt,
      lastViewedAt: viewedAt,
    });

    if (existingSession) {
      await tx.contentPostViewSession.update({
        where: { id: existingSession.id },
        data: {
          source,
          viewCount: { increment: 1 },
          lastViewedAt: viewedAt,
        },
      });
    } else {
      await tx.contentPostViewSession.create({
        data: {
          contentPostId: post.id,
          creatorProfileId: post.creatorProfileId,
          authorUserId: post.authorUserId,
          viewerUserId: actor.userId,
          viewerSessionKey,
          deviceHash,
          source,
          firstViewedAt: viewedAt,
          lastViewedAt: viewedAt,
        },
      });
    }

    const data: Prisma.ContentPostUpdateInput = {
      viewCount: { increment: nextState.increments.viewCount },
      ...(nextState.increments.uniqueViewCount
        ? { uniqueViewCount: { increment: nextState.increments.uniqueViewCount } }
        : {}),
      firstViewedAt: post.firstViewedAt ?? nextState.next.firstViewedAt,
      lastViewedAt: nextState.next.lastViewedAt,
      avgWatchTimeSeconds: nextState.next.averageWatchTimeSeconds,
      completionRate: nextState.next.completionRate,
      metadataJson: nextState.metadataJson,
    };

    return tx.contentPost.update({
      where: { id: post.id },
      data,
      select: {
        viewCount: true,
        uniqueViewCount: true,
        watchTimeSeconds: true,
        completedViewCount: true,
        avgWatchTimeSeconds: true,
        completionRate: true,
        likeCount: true,
        saveCount: true,
        shareCount: true,
        commentCount: true,
        firstViewedAt: true,
        lastViewedAt: true,
        metadataJson: true,
      },
    });
  });

  return buildSnapshot(updated);
}

export async function registerContentPostWatchTime(input: RegisterWatchTimeInput, actor: ViewerActor) {
  const post = await getPublicAnalyticsPost(input.postId);
  if (!post) return null;

  const safeSeconds = Math.max(0, Math.min(300, Math.round(input.secondsWatched || 0)));
  const viewerSessionKey = normalizeViewerSessionKey(input.viewerSessionId);
  const deviceHash = buildViewerDeviceHash(actor);
  const viewedAt = new Date();
  const source = mapContentViewSource(input.source);

  const updated = await prisma.$transaction(async (tx) => {
    const existingSession = await findExistingSession(tx, {
      postId: post.id,
      viewerSessionKey,
      viewerUserId: actor.userId,
      deviceHash,
    });
    const shouldMarkCompleted = Boolean(input.completed) && !existingSession?.completedViewCount;
    const nextState = buildAnalyticsMutationState(post, {
      addWatchTimeSeconds: safeSeconds,
      addCompletedViewCount: shouldMarkCompleted ? 1 : 0,
      viewerSessionId: viewerSessionKey,
      firstViewedAt: viewedAt,
      lastViewedAt: viewedAt,
    });
    const shouldPersistCompleted = nextState.increments.completedViewCount > 0;

    if (existingSession) {
      await tx.contentPostViewSession.update({
        where: { id: existingSession.id },
        data: {
          source,
          watchTimeSeconds: { increment: safeSeconds },
          ...(shouldPersistCompleted ? { completedViewCount: { increment: 1 } } : {}),
          lastViewedAt: viewedAt,
        },
      });
    } else {
      await tx.contentPostViewSession.create({
        data: {
          contentPostId: post.id,
          creatorProfileId: post.creatorProfileId,
          authorUserId: post.authorUserId,
          viewerUserId: actor.userId,
          viewerSessionKey,
          deviceHash,
          source,
          firstViewedAt: viewedAt,
          lastViewedAt: viewedAt,
          viewCount: 0,
          watchTimeSeconds: safeSeconds,
          completedViewCount: shouldPersistCompleted ? 1 : 0,
        },
      });
    }

    const data: Prisma.ContentPostUpdateInput = {
      ...(safeSeconds ? { watchTimeSeconds: { increment: safeSeconds } } : {}),
      ...(nextState.increments.completedViewCount
        ? { completedViewCount: { increment: nextState.increments.completedViewCount } }
        : {}),
      firstViewedAt: post.firstViewedAt ?? nextState.next.firstViewedAt,
      lastViewedAt: nextState.next.lastViewedAt,
      avgWatchTimeSeconds: nextState.next.averageWatchTimeSeconds,
      completionRate: nextState.next.completionRate,
      metadataJson: nextState.metadataJson,
    };

    return tx.contentPost.update({
      where: { id: post.id },
      data,
      select: {
        viewCount: true,
        uniqueViewCount: true,
        watchTimeSeconds: true,
        completedViewCount: true,
        avgWatchTimeSeconds: true,
        completionRate: true,
        likeCount: true,
        saveCount: true,
        shareCount: true,
        commentCount: true,
        firstViewedAt: true,
        lastViewedAt: true,
        metadataJson: true,
      },
    });
  });

  return buildSnapshot(updated);
}
