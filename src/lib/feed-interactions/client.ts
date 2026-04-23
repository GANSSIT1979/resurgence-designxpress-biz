import type { FeedPost } from '@/lib/feed/types';

export type FeedInteractionMetrics = FeedPost['metrics'];

type FeedLikeResponse = {
  liked: boolean;
  likeCount: number;
};

type FeedSaveResponse = {
  saved: boolean;
  saveCount: number;
};

type FeedShareResponse = {
  shareCount: number;
};

type FeedFollowResponse = {
  following: boolean;
};

type FeedCommentResponse = {
  item: {
    id: string;
    body: string;
    createdAt: string;
    author: {
      id: string;
      displayName: string;
      role: string;
    };
  };
};

type FeedStatsResponse = {
  metrics: FeedInteractionMetrics;
};

type FeedResponseError = {
  error?: string;
};

export class FeedInteractionClientError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'FeedInteractionClientError';
    this.status = status;
  }
}

async function readResponse<T>(response: Response, fallbackMessage: string) {
  const payload = (await response.json().catch(() => null)) as (T & FeedResponseError) | null;
  if (!response.ok) {
    throw new FeedInteractionClientError(payload?.error || fallbackMessage, response.status);
  }

  return payload as T;
}

async function postJson<T>(url: string, body: unknown, fallbackMessage: string) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  return readResponse<T>(response, fallbackMessage);
}

async function getJson<T>(url: string, fallbackMessage: string) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });

  return readResponse<T>(response, fallbackMessage);
}

export function getFeedInteractionErrorStatus(error: unknown) {
  return error instanceof FeedInteractionClientError ? error.status : null;
}

export function getFeedInteractionErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof FeedInteractionClientError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallbackMessage;
}

export function toggleFeedLike(postId: string) {
  return postJson<FeedLikeResponse>(`/api/feed/${postId}/like`, undefined, 'Unable to like posts.');
}

export function toggleFeedSave(postId: string) {
  return postJson<FeedSaveResponse>(`/api/feed/${postId}/save`, undefined, 'Unable to save posts.');
}

export function createFeedComment(postId: string, body: string) {
  return postJson<FeedCommentResponse>(`/api/feed/${postId}/comments`, { body }, 'Unable to comment.');
}

export function toggleCreatorFollow(creatorId: string) {
  return postJson<FeedFollowResponse>(`/api/feed/creators/${creatorId}/follow`, undefined, 'Unable to follow creators.');
}

export function recordFeedShare(postId: string) {
  return postJson<FeedShareResponse>(`/api/feed/${postId}/share`, undefined, 'Unable to share this post.');
}

export function fetchFeedStats(postId: string) {
  return getJson<FeedStatsResponse>(`/api/feed/${postId}/stats`, 'Unable to refresh feed stats.');
}
