'use client';

import { useEffect } from 'react';

export type FeedToastTone = 'info' | 'success' | 'error';

export type FeedToastItem = {
  id: string;
  message: string;
  tone: FeedToastTone;
};

function FeedToastCard({
  item,
  onDismiss,
}: {
  item: FeedToastItem;
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timeout = window.setTimeout(() => onDismiss(item.id), item.tone === 'error' ? 3400 : 2400);
    return () => window.clearTimeout(timeout);
  }, [item.id, item.tone, onDismiss]);

  return (
    <div className={`feed-toast feed-toast-${item.tone}`} role="status" aria-live="polite">
      <span>{item.message}</span>
      <button type="button" onClick={() => onDismiss(item.id)} aria-label="Dismiss notification">
        Dismiss
      </button>
    </div>
  );
}

export function FeedToastViewport({
  items,
  onDismiss,
}: {
  items: FeedToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (!items.length) return null;

  return (
    <div className="feed-toast-viewport" aria-live="polite" aria-label="Feed notifications">
      {items.map((item) => (
        <FeedToastCard key={item.id} item={item} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
