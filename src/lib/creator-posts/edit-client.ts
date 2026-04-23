import type {
  CreatorPostEditPayload,
  CreatorPostUpdateResponse,
} from '@/lib/creator-posts/edit-types';

export async function updateCreatorPost(
  postId: string,
  payload: CreatorPostEditPayload,
): Promise<CreatorPostUpdateResponse> {
  const response = await fetch(`/api/creator/posts/${postId}/update`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as CreatorPostUpdateResponse;
  if (!response.ok || (!data.ok && !data.success)) {
    throw new Error(data.error || 'Failed to update creator post.');
  }

  return data;
}
