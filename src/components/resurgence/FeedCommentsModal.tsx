'use client';

import { useEffect, useState } from 'react';
import type { FeedPost } from '@/lib/feed/types';
import { CommentsPanel } from './CommentsPanel';
import { CommentsDrawerHeader } from './CommentsDrawerHeader';

type Viewer = {
  id: string;
  role: string;
  displayName?: string | null;
} | null;

export function FeedCommentsModal({
  post,
  open,
  viewer = null,
  initialCount = 0,
  onClose,
  onCountChange,
}: {
  post: FeedPost | null;
  open: boolean;
  viewer?: Viewer;
  initialCount?: number;
  onClose: () => void;
  onCountChange?: (postId: string, visibleCount: number) => void;
}) {
  const [totalCount, setTotalCount] = useState(initialCount);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose, open]);

  useEffect(() => {
    setTotalCount(initialCount);
  }, [initialCount, post?.id]);

  if (!open || !post) return null;

  return (
    <div className="feed-comments-overlay" role="dialog" aria-modal="true" aria-label="Feed comments">
      <button
        type="button"
        className="feed-comments-backdrop"
        aria-label="Close comments"
        onClick={onClose}
      />

      <div className="feed-comments-sheet">
        <div className="feed-comments-sheet-handle" aria-hidden="true" />

        <CommentsDrawerHeader post={post} totalCount={totalCount} onClose={onClose} />

        <CommentsPanel
          postId={post.id}
          viewer={viewer}
          initialCount={initialCount}
          showHeader={false}
          onStatsChange={(stats) => {
            setTotalCount(stats.totalCount);
            onCountChange?.(post.id, stats.visibleCount);
          }}
        />
      </div>
    </div>
  );
}
