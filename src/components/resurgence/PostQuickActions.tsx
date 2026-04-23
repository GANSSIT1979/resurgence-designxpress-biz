'use client';

import type { CreatorPostsManagerItem } from '@/lib/creator-posts/types';

function getPrimaryLabel(post: CreatorPostsManagerItem) {
  if (post.status === 'PUBLISHED') return 'Unpublish';
  if (post.status === 'PENDING_REVIEW') return 'Move to draft';
  return 'Submit review';
}

export default function PostQuickActions({
  post,
  pendingAction,
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
  onDuplicate,
}: {
  post: CreatorPostsManagerItem;
  pendingAction?: string | null;
  onEdit?: (post: CreatorPostsManagerItem) => void;
  onDelete?: (post: CreatorPostsManagerItem) => void;
  onPublish?: (post: CreatorPostsManagerItem) => void;
  onUnpublish?: (post: CreatorPostsManagerItem) => void;
  onDuplicate?: (post: CreatorPostsManagerItem) => void;
}) {
  const isPublished = post.status === 'PUBLISHED';
  const primaryAction = isPublished ? onUnpublish : onPublish;
  const busy = Boolean(pendingAction);

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onEdit?.(post)}
        disabled={busy}
        className="inline-flex min-h-10 items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/85 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pendingAction === 'edit' ? 'Opening...' : 'Edit'}
      </button>

      <button
        type="button"
        onClick={() => primaryAction?.(post)}
        disabled={busy}
        className="inline-flex min-h-10 items-center rounded-full border border-fuchsia-400/25 bg-fuchsia-400/10 px-4 py-2 text-sm text-fuchsia-50 transition hover:border-fuchsia-300/30 hover:bg-fuchsia-400/15 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pendingAction === 'status'
          ? isPublished
            ? 'Updating...'
            : 'Submitting...'
          : getPrimaryLabel(post)}
      </button>

      <button
        type="button"
        onClick={() => onDuplicate?.(post)}
        disabled={busy}
        className="inline-flex min-h-10 items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/75 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pendingAction === 'duplicate' ? 'Duplicating...' : 'Duplicate'}
      </button>

      <button
        type="button"
        onClick={() => onDelete?.(post)}
        disabled={busy}
        className="inline-flex min-h-10 items-center rounded-full border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm text-rose-100 transition hover:border-rose-300/30 hover:bg-rose-400/15 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pendingAction === 'delete' ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  );
}
