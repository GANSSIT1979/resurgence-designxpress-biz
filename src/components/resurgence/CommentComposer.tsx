'use client';

import { useState } from 'react';

export function CommentComposer({
  onSubmit,
  isSaving,
  placeholder = 'Add a comment...',
  buttonLabel = 'Post',
}: {
  onSubmit: (body: string) => Promise<void> | void;
  isSaving?: boolean;
  placeholder?: string;
  buttonLabel?: string;
}) {
  const [body, setBody] = useState('');

  return (
    <form
      className="feed-comment-composer"
      onSubmit={async (event) => {
        event.preventDefault();
        const value = body.trim();
        if (!value) return;
        await onSubmit(value);
        setBody('');
      }}
    >
      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={3}
        placeholder={placeholder}
        className="feed-comment-input"
      />
      <div className="feed-comment-composer-actions">
        <button type="submit" disabled={isSaving || !body.trim()} className="feed-comment-submit">
          {isSaving ? 'Saving...' : buttonLabel}
        </button>
      </div>
    </form>
  );
}
