'use client';

import type { FeedPost } from '@/lib/feed/types';

export function CommentsDrawerHeader({
  post,
  totalCount,
  onClose,
}: {
  post: FeedPost;
  totalCount: number;
  onClose: () => void;
}) {
  const creatorName = post.creator?.name || post.author?.displayName || 'Resurgence';
  const creatorHandle = post.creator ? `@${post.creator.slug}` : post.author?.displayName ? `@${post.author.displayName}` : '@resurgence';
  const summary = post.caption || 'Join the conversation around this creator moment.';

  return (
    <header className="feed-comments-sheet-head">
      <div>
        <div className="section-kicker">Comments</div>
        <h3>{creatorName}</h3>
        <p>{summary}</p>
        <div className="feed-comments-summary">
          <span>{creatorHandle}</span>
          <span className="feed-comments-total-pill">
            {totalCount} comment{totalCount === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <div className="feed-comments-sheet-actions">
        <button type="button" className="feed-comments-close" onClick={onClose} aria-label="Close comments">
          Close
        </button>
      </div>
    </header>
  );
}
