import type { AnalyticsRouteSuccess } from './types';

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
    keepalive: true,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || 'Analytics request failed.');
  }

  return data as T;
}

export function getViewerSessionId(postId: string) {
  if (typeof window === 'undefined') return `server-${postId}`;

  const key = `resurgence:viewer-session:${postId}`;
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;

  const id = `vw_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
  window.localStorage.setItem(key, id);
  return id;
}

export function registerPostView(postId: string, source = 'feed') {
  const viewerSessionId = getViewerSessionId(postId);
  return postJson<AnalyticsRouteSuccess>(`/api/feed/${postId}/view`, {
    viewerSessionId,
    source,
    surfacedAt: new Date().toISOString(),
  });
}

export function registerPostWatchTime(postId: string, secondsWatched: number, completed = false, source = 'feed') {
  const viewerSessionId = getViewerSessionId(postId);
  return postJson<AnalyticsRouteSuccess>(`/api/feed/${postId}/watchtime`, {
    viewerSessionId,
    secondsWatched,
    completed,
    source,
  });
}
