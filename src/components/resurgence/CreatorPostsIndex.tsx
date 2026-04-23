'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import CreatorPostCard from '@/components/resurgence/CreatorPostCard';
import PostStatusTabs from '@/components/resurgence/PostStatusTabs';
import type {
  CreatorPostsFilterValue,
  CreatorPostsManagerItem,
} from '@/lib/creator-posts/types';
import {
  filterPostsByStatus,
  formatCompactNumber,
  mapFeedPostToCreatorPostsManagerItem,
  summarizePosts,
  sortPostsByRecency,
} from '@/lib/creator-posts/utils';
import type { FeedPost } from '@/lib/feed/types';

async function requestJson(url: string, init: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Unable to complete the request.');
  }
  return data;
}

export default function CreatorPostsIndex({
  initialPosts,
  title = 'Creator posts',
  subtitle = 'Manage drafts, review-ready videos, and published creator content without leaving the creator workspace.',
  createHref = '/creator/posts/new',
}: {
  initialPosts: FeedPost[];
  title?: string;
  subtitle?: string;
  createHref?: string;
}) {
  const router = useRouter();
  const [posts, setPosts] = useState<CreatorPostsManagerItem[]>(
    initialPosts.map(mapFeedPostToCreatorPostsManagerItem),
  );
  const [filter, setFilter] = useState<CreatorPostsFilterValue>('ALL');
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingPostId, setPendingPostId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const orderedPosts = useMemo(() => sortPostsByRecency(posts), [posts]);
  const summary = useMemo(() => summarizePosts(orderedPosts), [orderedPosts]);
  const filtered = useMemo(() => filterPostsByStatus(orderedPosts, filter), [orderedPosts, filter]);

  const counts: Record<CreatorPostsFilterValue, number> = {
    ALL: orderedPosts.length,
    PUBLISHED: summary.published,
    PENDING_REVIEW: summary.inReview,
    DRAFT: summary.drafts,
    ARCHIVED: summary.archived,
  };

  async function runPostMutation(
    post: CreatorPostsManagerItem,
    action: 'publish' | 'unpublish' | 'archive' | 'duplicate',
    options?: {
      method?: 'POST' | 'DELETE';
      pendingAction?: 'status' | 'archive' | 'duplicate';
      notice?: (item: FeedPost) => string;
      insertNewItem?: boolean;
    },
  ) {
    setPendingPostId(post.id);
    setPendingAction(options?.pendingAction ?? 'status');
    setNotice(null);
    setError(null);

    try {
      const data = await requestJson(`/api/creator/posts/${post.id}/${action}`, {
        method: options?.method ?? 'POST',
      });
      const item = data.item as FeedPost | null;
      if (!item) throw new Error('The post updated, but the server did not return the refreshed record.');

      setPosts((current) => {
        const nextItem = mapFeedPostToCreatorPostsManagerItem(item);
        if (options?.insertNewItem) return [nextItem, ...current];
        return current.map((entry) => (entry.id === post.id ? nextItem : entry));
      });
      setNotice(
        options?.notice?.(item) ??
          (item.status === 'PUBLISHED'
            ? 'Post published.'
            : item.status === 'PENDING_REVIEW'
              ? 'Post submitted for review.'
              : item.status === 'ARCHIVED'
                ? 'Post archived.'
                : 'Post moved back to draft.'),
      );
      router.refresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Unable to update the post status.');
    } finally {
      setPendingPostId(null);
      setPendingAction(null);
    }
  }

  async function runStatusAction(post: CreatorPostsManagerItem, nextStatus: 'PUBLISHED' | 'DRAFT') {
    await runPostMutation(post, nextStatus === 'PUBLISHED' ? 'publish' : 'unpublish', {
      pendingAction: 'status',
    });
  }

  async function archivePost(post: CreatorPostsManagerItem) {
    await runPostMutation(post, 'archive', {
      pendingAction: 'archive',
      notice: () => 'Post archived.',
    });
  }

  async function duplicatePost(post: CreatorPostsManagerItem) {
    await runPostMutation(post, 'duplicate', {
      pendingAction: 'duplicate',
      insertNewItem: true,
      notice: () => 'Draft duplicated successfully.',
    });
  }

  async function deletePost(post: CreatorPostsManagerItem) {
    if (!window.confirm('Delete this creator post? It will be removed from your management view and hidden from the public feed.')) {
      return;
    }

    setPendingPostId(post.id);
    setPendingAction('delete');
    setNotice(null);
    setError(null);

    try {
      await requestJson(`/api/creator/posts/${post.id}/delete`, { method: 'DELETE' });
      setPosts((current) => current.filter((entry) => entry.id !== post.id));
      setNotice('Post deleted.');
      router.refresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Unable to delete the post.');
    } finally {
      setPendingPostId(null);
      setPendingAction(null);
    }
  }

  function openEditor(post: CreatorPostsManagerItem) {
    setPendingPostId(post.id);
    setPendingAction('edit');
    router.push(`/creator/posts/new?edit=${encodeURIComponent(post.id)}`);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/10 bg-slate-950/88 p-5 shadow-2xl shadow-black/20 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.28em] text-fuchsia-200/75">Creator feed manager</div>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">{title}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/65">{subtitle}</p>
          </div>

          <a
            href={createHref}
            className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-90"
          >
            Create new post
          </a>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-white/40">Total posts</div>
            <div className="mt-2 text-3xl font-semibold text-white">{summary.total}</div>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-white/40">Published</div>
            <div className="mt-2 text-3xl font-semibold text-white">{summary.published}</div>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-white/40">In review</div>
            <div className="mt-2 text-3xl font-semibold text-white">{summary.inReview}</div>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-white/40">Drafts</div>
            <div className="mt-2 text-3xl font-semibold text-white">{summary.drafts}</div>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-white/40">Feed views</div>
            <div className="mt-2 text-3xl font-semibold text-white">{formatCompactNumber(summary.totalViews)}</div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <PostStatusTabs value={filter} counts={counts} onChange={setFilter} />
          <div className="text-sm text-white/55">
            Showing <span className="text-white">{filtered.length}</span> of <span className="text-white">{orderedPosts.length}</span> posts
          </div>
        </div>

        {notice ? (
          <div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-50">
            {notice}
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}
      </section>

      {filtered.length === 0 ? (
        <section className="rounded-[28px] border border-dashed border-white/10 bg-slate-950/72 p-8 text-center shadow-2xl shadow-black/20">
          <div className="mx-auto max-w-2xl">
            <div className="text-xs uppercase tracking-[0.24em] text-white/40">
              {filter === 'ALL' ? 'No creator posts yet' : `No ${filter.toLowerCase().replace(/_/g, ' ')} posts yet`}
            </div>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white">
              Build out your creator feed pipeline
            </h3>
            <p className="mt-3 text-sm leading-6 text-white/62">
              Use the creator composer to upload a vertical video, save a draft, and move it into the current review-safe feed workflow.
            </p>
            <div className="mt-5">
              <a
                href={createHref}
                className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-90"
              >
                Create post
              </a>
            </div>
          </div>
        </section>
      ) : (
        <div className="space-y-4">
          {filtered.map((post) => {
            const isPending = pendingPostId === post.id ? pendingAction : null;
            return (
              <CreatorPostCard
                key={post.id}
                post={post}
                pendingAction={isPending}
                onEdit={openEditor}
                onDelete={deletePost}
                onPublish={(item) => runStatusAction(item, 'PUBLISHED')}
                onUnpublish={(item) => runStatusAction(item, 'DRAFT')}
                onArchive={archivePost}
                onDuplicate={duplicatePost}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
