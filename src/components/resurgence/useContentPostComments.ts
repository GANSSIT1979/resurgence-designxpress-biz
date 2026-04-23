'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createComment,
  deleteComment,
  fetchComments,
  fetchCommentStats,
  moderateComment,
  replyToComment,
  updateComment,
} from '@/lib/contentpost-comments/client';
import type {
  CommentStats,
  CommentTreeResponse,
  ContentPostCommentRecord,
  ModerateCommentInput,
} from '@/lib/contentpost-comments/types';

type Viewer = {
  id: string;
  role: string;
  displayName?: string | null;
} | null;

type Toast = {
  id: string;
  tone: 'success' | 'error' | 'info';
  message: string;
};

function emptyTree(postId: string, initialCount: number): CommentTreeResponse {
  return {
    postId,
    totalCount: initialCount,
    visibleCount: initialCount,
    hiddenCount: 0,
    comments: [],
    permissions: {
      canComment: false,
      canModerate: false,
    },
  };
}

function pushComment(rows: ContentPostCommentRecord[], comment: ContentPostCommentRecord) {
  return [...rows, comment];
}

function patchComment(
  rows: ContentPostCommentRecord[],
  commentId: string,
  updater: (row: ContentPostCommentRecord) => ContentPostCommentRecord,
): ContentPostCommentRecord[] {
  return rows.map((row) => {
    if (row.id === commentId) return updater(row);
    return {
      ...row,
      replies: patchComment(row.replies, commentId, updater),
    };
  });
}

function insertReply(
  rows: ContentPostCommentRecord[],
  parentId: string,
  reply: ContentPostCommentRecord,
): ContentPostCommentRecord[] {
  return rows.map((row) => {
    if (row.id === parentId) {
      return {
        ...row,
        replies: [...row.replies, reply],
        replyCount: row.replyCount + 1,
      };
    }

    return {
      ...row,
      replies: insertReply(row.replies, parentId, reply),
    };
  });
}

function removeComment(rows: ContentPostCommentRecord[], commentId: string): ContentPostCommentRecord[] {
  return rows
    .filter((row) => row.id !== commentId)
    .map((row) => ({
      ...row,
      replies: removeComment(row.replies, commentId),
    }));
}

function replaceComment(
  rows: ContentPostCommentRecord[],
  tempId: string,
  comment: ContentPostCommentRecord,
): ContentPostCommentRecord[] {
  return rows.map((row) => {
    if (row.id === tempId) return comment;
    return {
      ...row,
      replies: replaceComment(row.replies, tempId, comment),
    };
  });
}

export function useContentPostComments({
  postId,
  viewer,
  initialCount = 0,
  onStatsChange,
}: {
  postId: string;
  viewer?: Viewer;
  initialCount?: number;
  onStatsChange?: (stats: CommentStats) => void;
}) {
  const [tree, setTree] = useState<CommentTreeResponse>(() => emptyTree(postId, initialCount));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = useCallback((tone: Toast['tone'], message: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((current) => [...current, { id, tone, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, tone === 'error' ? 3400 : 2400);
  }, []);

  const applyStats = useCallback(
    (stats: CommentStats) => {
      setTree((current) => ({
        ...current,
        totalCount: current.permissions.canModerate ? stats.totalCount : stats.visibleCount,
        visibleCount: stats.visibleCount,
        hiddenCount: current.permissions.canModerate ? stats.hiddenCount : 0,
      }));
      onStatsChange?.(stats);
    },
    [onStatsChange],
  );

  const refresh = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!options?.silent) {
        setIsLoading(true);
      }

      try {
        const data = await fetchComments(postId);
        setTree(data);
        onStatsChange?.({
          postId,
          totalCount: data.totalCount,
          visibleCount: data.visibleCount,
          hiddenCount: data.hiddenCount,
        });
      } catch (error) {
        pushToast('error', error instanceof Error ? error.message : 'Failed to load comments.');
      } finally {
        if (!options?.silent) {
          setIsLoading(false);
        }
      }
    },
    [onStatsChange, postId, pushToast],
  );

  const refreshCounts = useCallback(async () => {
    try {
      const stats = await fetchCommentStats(postId);
      applyStats(stats);
      return stats;
    } catch (error) {
      pushToast('error', error instanceof Error ? error.message : 'Failed to refresh comment counts.');
      return null;
    }
  }, [applyStats, postId, pushToast]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const submitComment = useCallback(
    async (body: string, parentId?: string | null) => {
      if (!viewer?.id) {
        pushToast('error', 'Please log in to comment.');
        return;
      }

      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const optimisticComment: ContentPostCommentRecord = {
        id: tempId,
        postId,
        authorId: viewer.id,
        parentId: parentId ?? null,
        body,
        depth: parentId ? 1 : 0,
        status: 'VISIBLE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: {
          id: viewer.id,
          displayName: viewer.displayName ?? 'You',
          role: viewer.role,
        },
        replies: [],
        replyCount: 0,
      };

      const previousTree = tree;
      setIsSaving(true);
      setTree((current) => ({
        ...current,
        totalCount: current.totalCount + 1,
        visibleCount: current.visibleCount + 1,
        comments: parentId
          ? insertReply(current.comments, parentId, optimisticComment)
          : pushComment(current.comments, optimisticComment),
      }));

      try {
        const response = parentId
          ? await replyToComment(postId, parentId, body)
          : await createComment(postId, body);

        setTree((current) => ({
          ...current,
          comments: replaceComment(current.comments, tempId, response.comment),
        }));
        applyStats(response.stats);
        pushToast('success', parentId ? 'Reply posted.' : 'Comment posted.');
      } catch (error) {
        setTree(previousTree);
        pushToast('error', error instanceof Error ? error.message : 'Failed to post comment.');
      } finally {
        setIsSaving(false);
      }
    },
    [applyStats, postId, pushToast, tree, viewer],
  );

  const editExistingComment = useCallback(
    async (commentId: string, body: string) => {
      const previousTree = tree;
      setIsSaving(true);
      setTree((current) => ({
        ...current,
        comments: patchComment(current.comments, commentId, (row) => ({
          ...row,
          body,
          updatedAt: new Date().toISOString(),
        })),
      }));

      try {
        const response = await updateComment(postId, commentId, body);
        setTree((current) => ({
          ...current,
          comments: patchComment(current.comments, commentId, () => response.comment),
        }));
        pushToast('success', 'Comment updated.');
      } catch (error) {
        setTree(previousTree);
        pushToast('error', error instanceof Error ? error.message : 'Failed to update comment.');
      } finally {
        setIsSaving(false);
      }
    },
    [postId, pushToast, tree],
  );

  const removeExistingComment = useCallback(
    async (commentId: string) => {
      const previousTree = tree;
      setIsSaving(true);
      setTree((current) => ({
        ...current,
        totalCount: Math.max(0, current.totalCount - 1),
        visibleCount: Math.max(0, current.visibleCount - 1),
        comments: removeComment(current.comments, commentId),
      }));

      try {
        const response = await deleteComment(postId, commentId);
        applyStats(response.stats);
        await refresh({ silent: true });
        pushToast('success', 'Comment removed.');
      } catch (error) {
        setTree(previousTree);
        pushToast('error', error instanceof Error ? error.message : 'Failed to remove comment.');
      } finally {
        setIsSaving(false);
      }
    },
    [applyStats, postId, pushToast, tree],
  );

  const moderateExistingComment = useCallback(
    async (commentId: string, moderation: ModerateCommentInput) => {
      const previousTree = tree;
      setIsSaving(true);
      setTree((current) => {
        const comments =
          moderation.action === 'remove'
            ? removeComment(current.comments, commentId)
            : patchComment(current.comments, commentId, (row) => ({
                ...row,
                status: moderation.action === 'hide' ? 'HIDDEN' : 'VISIBLE',
              }));

        return { ...current, comments };
      });

      try {
        const response = await moderateComment(postId, commentId, moderation);
        if (moderation.action !== 'remove') {
          setTree((current) => ({
            ...current,
            comments: patchComment(current.comments, commentId, () => response.comment),
          }));
        } else {
          await refresh({ silent: true });
        }
        applyStats(response.stats);
        pushToast('success', 'Moderation action applied.');
      } catch (error) {
        setTree(previousTree);
        pushToast('error', error instanceof Error ? error.message : 'Failed to moderate comment.');
      } finally {
        setIsSaving(false);
      }
    },
    [applyStats, postId, pushToast, refresh, tree],
  );

  return useMemo(
    () => ({
      tree,
      isLoading,
      isSaving,
      toasts,
      refresh,
      refreshCounts,
      submitComment,
      editExistingComment,
      removeExistingComment,
      moderateExistingComment,
    }),
    [
      editExistingComment,
      isLoading,
      isSaving,
      moderateExistingComment,
      refresh,
      refreshCounts,
      removeExistingComment,
      submitComment,
      toasts,
      tree,
    ],
  );
}
