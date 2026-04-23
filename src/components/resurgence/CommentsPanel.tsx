'use client';

import Link from 'next/link';
import { CommentComposer } from './CommentComposer';
import { CommentThread } from './CommentThread';
import { CommentsToastViewport } from './CommentsToastViewport';
import { useContentPostComments } from './useContentPostComments';

type Viewer = {
  id: string;
  role: string;
  displayName?: string | null;
} | null;

export function CommentsPanel({
  postId,
  viewer,
  initialCount = 0,
  onStatsChange,
}: {
  postId: string;
  viewer?: Viewer;
  initialCount?: number;
  onStatsChange?: (stats: { postId: string; totalCount: number; visibleCount: number; hiddenCount: number }) => void;
}) {
  const {
    tree,
    isLoading,
    isSaving,
    toasts,
    submitComment,
    editExistingComment,
    removeExistingComment,
    moderateExistingComment,
  } = useContentPostComments({
    postId,
    viewer,
    initialCount,
    onStatsChange,
  });

  return (
    <section className="feed-comments-panel">
      <header className="feed-comments-panel-header">
        <div>
          <div className="section-kicker">Comments</div>
          <h3>{tree.totalCount} comment{tree.totalCount === 1 ? '' : 's'} in thread</h3>
          {tree.permissions.canModerate && tree.hiddenCount ? (
            <p>{tree.hiddenCount} hidden comment{tree.hiddenCount === 1 ? '' : 's'} still available to moderators.</p>
          ) : (
            <p>Replies, moderation, and count refresh stay synced with the live feed stats.</p>
          )}
        </div>
      </header>

      {tree.permissions.canComment ? (
        <CommentComposer onSubmit={(body) => submitComment(body)} isSaving={isSaving} />
      ) : (
        <div className="feed-comments-login">
          <strong>Join the conversation</strong>
          <span>Log in to post comments, reply to creators, and save discussions to your member activity.</span>
          <Link href="/login">Log in</Link>
        </div>
      )}

      {isLoading ? <div className="feed-comment-empty">Loading comments...</div> : null}

      {!isLoading && !tree.comments.length ? (
        <div className="feed-comment-empty">No comments yet. Start the conversation for this post.</div>
      ) : null}

      <div className="feed-comments-list">
        {tree.comments.map((comment) => (
          <CommentThread
            key={comment.id}
            comment={comment}
            viewerId={viewer?.id ?? null}
            canReply={tree.permissions.canComment}
            canModerate={tree.permissions.canModerate}
            isSaving={isSaving}
            onReply={submitComment}
            onEdit={editExistingComment}
            onDelete={removeExistingComment}
            onModerate={moderateExistingComment}
          />
        ))}
      </div>

      <CommentsToastViewport toasts={toasts} />
    </section>
  );
}
