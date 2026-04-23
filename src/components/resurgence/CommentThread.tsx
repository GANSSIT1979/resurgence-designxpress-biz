'use client';

import { useMemo, useState } from 'react';
import type { ContentPostCommentRecord, ModerateCommentInput } from '@/lib/contentpost-comments/types';
import { CommentComposer } from './CommentComposer';

function formatTimestamp(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function CommentThread({
  comment,
  viewerId,
  canReply,
  canModerate,
  isSaving = false,
  onReply,
  onEdit,
  onDelete,
  onModerate,
}: {
  comment: ContentPostCommentRecord;
  viewerId?: string | null;
  canReply?: boolean;
  canModerate?: boolean;
  isSaving?: boolean;
  onReply: (parentId: string, body: string) => Promise<void> | void;
  onEdit: (commentId: string, body: string) => Promise<void> | void;
  onDelete: (commentId: string) => Promise<void> | void;
  onModerate: (commentId: string, moderation: ModerateCommentInput) => Promise<void> | void;
}) {
  const [showReply, setShowReply] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(comment.body);
  const isOwner = Boolean(viewerId && comment.authorId === viewerId);
  const canDelete = isOwner || canModerate;
  const timestamp = useMemo(() => formatTimestamp(comment.createdAt), [comment.createdAt]);

  return (
    <article className={`feed-comment-thread ${comment.status === 'HIDDEN' ? 'is-hidden' : ''}`}>
      <div className="feed-comment-avatar" aria-hidden="true">
        {(comment.author?.displayName || 'M').slice(0, 1).toUpperCase()}
      </div>

      <div className="feed-comment-main">
        <div className="feed-comment-head">
          <div className="feed-comment-meta">
            <strong>{comment.author?.displayName || 'Member'}</strong>
            {comment.author?.role ? <span>{comment.author.role.replace(/_/g, ' ')}</span> : null}
            {timestamp ? <span>{timestamp}</span> : null}
          </div>
          <span className={`feed-comment-status feed-comment-status-${comment.status.toLowerCase()}`}>
            {comment.status}
          </span>
        </div>

        {isEditing ? (
          <div className="feed-comment-edit">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={3}
              className="feed-comment-input"
            />
            <div className="feed-comment-actions">
              <button
                type="button"
                className="feed-comment-action-primary"
                disabled={isSaving || !draft.trim()}
                onClick={async () => {
                  await onEdit(comment.id, draft);
                  setIsEditing(false);
                }}
              >
                Save edit
              </button>
              <button
                type="button"
                className="feed-comment-action"
                onClick={() => {
                  setDraft(comment.body);
                  setIsEditing(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="feed-comment-body">{comment.body}</p>
        )}

        <div className="feed-comment-actions">
          {canReply ? (
            <button type="button" className="feed-comment-action" onClick={() => setShowReply((value) => !value)}>
              {showReply ? 'Close reply' : 'Reply'}
            </button>
          ) : null}

          {isOwner ? (
            <button type="button" className="feed-comment-action" onClick={() => setIsEditing((value) => !value)}>
              {isEditing ? 'Close edit' : 'Edit'}
            </button>
          ) : null}

          {canDelete ? (
            <button type="button" className="feed-comment-action" onClick={() => onDelete(comment.id)}>
              Delete
            </button>
          ) : null}

          {canModerate ? (
            <>
              <button
                type="button"
                className="feed-comment-action"
                onClick={() =>
                  onModerate(comment.id, {
                    action: comment.status === 'HIDDEN' ? 'unhide' : 'hide',
                  })
                }
              >
                {comment.status === 'HIDDEN' ? 'Unhide' : 'Hide'}
              </button>
              <button
                type="button"
                className="feed-comment-action"
                onClick={() => onModerate(comment.id, { action: 'remove' })}
              >
                Remove
              </button>
            </>
          ) : null}
        </div>

        {showReply ? (
          <div className="feed-comment-reply-composer">
            <CommentComposer
              isSaving={isSaving}
              buttonLabel="Reply"
              placeholder="Write a reply..."
              onSubmit={(body) => onReply(comment.id, body)}
            />
          </div>
        ) : null}

        {comment.replies.length ? (
          <div className="feed-comment-replies">
            {comment.replies.map((reply) => (
              <CommentThread
                key={reply.id}
                comment={reply}
                viewerId={viewerId}
                canReply={canReply}
                canModerate={canModerate}
                isSaving={isSaving}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onModerate={onModerate}
              />
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
