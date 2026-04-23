import type {
  CommentStats,
  CommentTreeResponse,
  ContentPostCommentRecord,
  ModerateCommentInput,
} from './types';

async function readJson<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = (data as { error?: string })?.error || 'Request failed.';
    throw new Error(message);
  }
  return data as T;
}

export async function fetchComments(postId: string) {
  const response = await fetch(`/api/feed/${postId}/comments`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });

  return readJson<CommentTreeResponse>(response);
}

export async function createComment(postId: string, body: string) {
  const response = await fetch(`/api/feed/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  });

  return readJson<{ comment: ContentPostCommentRecord; stats: CommentStats }>(response);
}

export async function replyToComment(postId: string, commentId: string, body: string) {
  const response = await fetch(`/api/feed/${postId}/comments/${commentId}/reply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  });

  return readJson<{ comment: ContentPostCommentRecord; stats: CommentStats }>(response);
}

export async function updateComment(postId: string, commentId: string, body: string) {
  const response = await fetch(`/api/feed/${postId}/comments/${commentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  });

  return readJson<{ comment: ContentPostCommentRecord }>(response);
}

export async function deleteComment(postId: string, commentId: string) {
  const response = await fetch(`/api/feed/${postId}/comments/${commentId}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });

  return readJson<{ comment: ContentPostCommentRecord; stats: CommentStats }>(response);
}

export async function moderateComment(postId: string, commentId: string, moderation: ModerateCommentInput) {
  const response = await fetch(`/api/feed/${postId}/comments/${commentId}/moderate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(moderation),
  });

  return readJson<{ comment: ContentPostCommentRecord; stats: CommentStats }>(response);
}

export async function fetchCommentStats(postId: string) {
  const response = await fetch(`/api/feed/${postId}/stats`, {
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });

  const data = await readJson<{ comments: CommentStats }>(response);
  return data.comments;
}
