import type { TrackShareBody, TrackShareResponse } from './types';

export async function trackPostShare(postId: string, body: TrackShareBody) {
  const response = await fetch(`/api/feed/${encodeURIComponent(postId)}/share`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(body),
    keepalive: true,
  });

  const payload = (await response.json().catch(() => null)) as TrackShareResponse | { error?: string } | null;
  if (!response.ok) {
    throw new Error(payload && 'error' in payload && payload.error ? payload.error : `Share tracking failed with status ${response.status}.`);
  }

  return payload as TrackShareResponse | null;
}
