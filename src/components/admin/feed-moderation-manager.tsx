'use client';

import { useState } from 'react';

type AdminFeedPost = {
  id: string;
  caption: string;
  summary: string | null;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'PUBLISHED' | 'HIDDEN' | 'ARCHIVED' | 'DELETED';
  visibility: 'PUBLIC' | 'MEMBERS_ONLY' | 'PRIVATE';
  isFeatured: boolean;
  isPinned: boolean;
  moderationReason: string;
  publishedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  metrics: { likes: number; comments: number; saves: number; shares: number; views: number };
  author: { id: string; displayName: string; email: string; role: string } | null;
  creator: { id: string; name: string; slug: string; roleLabel: string; imageUrl: string | null } | null;
  media: Array<{ id: string; mediaType: string; url: string; thumbnailUrl: string | null; altText: string | null }>;
  hashtags: Array<{ id: string; label: string }>;
  productTags: Array<{ id: string; label: string; productName: string | null; productSlug: string | null }>;
  placementCount: number;
};

type AdminPlacement = {
  id: string;
  title: string;
  placementType: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
  startsAt: string | null;
  endsAt: string | null;
  ctaLabel: string;
  ctaHref: string;
  budgetAmount: number | null;
  impressionGoal: number | null;
  impressionCount: number;
  clickCount: number;
  moderationNote: string;
  createdAt: string;
  updatedAt: string;
  sponsor: { id: string; name: string; tier: string } | null;
  sponsorProfile: { id: string; companyName: string; contactName: string; contactEmail: string } | null;
  post: { id: string; caption: string; status: string; visibility: string; publishedAt: string | null; creatorName: string | null } | null;
  product: { id: string; name: string; slug: string; imageUrl: string | null; price: number } | null;
};

const postStatuses: AdminFeedPost['status'][] = ['DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'HIDDEN', 'ARCHIVED', 'DELETED'];
const postVisibilities: AdminFeedPost['visibility'][] = ['PUBLIC', 'MEMBERS_ONLY', 'PRIVATE'];
const placementStatuses: AdminPlacement['status'][] = ['DRAFT', 'PENDING', 'APPROVED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED', 'REJECTED'];

function statusLabel(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatDate(value: string | null | undefined) {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not set';

  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function toDateInput(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function formatCurrency(value: number | null) {
  if (!value) return 'No budget';
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCompact(value: number | null | undefined) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value ?? 0);
}

async function requestJson(url: string, body: Record<string, unknown>) {
  const response = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Unable to save moderation update.');
  return data;
}

export function FeedModerationManager({
  initialPosts,
  initialPlacements,
}: {
  initialPosts: AdminFeedPost[];
  initialPlacements: AdminPlacement[];
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [placements, setPlacements] = useState(initialPlacements);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  const postCounts = {
    pending: posts.filter((post) => post.status === 'PENDING_REVIEW').length,
    published: posts.filter((post) => post.status === 'PUBLISHED').length,
    hidden: posts.filter((post) => ['HIDDEN', 'ARCHIVED'].includes(post.status)).length,
  };
  const placementCounts = {
    pending: placements.filter((placement) => placement.status === 'PENDING').length,
    live: placements.filter((placement) => ['APPROVED', 'ACTIVE'].includes(placement.status)).length,
  };

  function updatePostDraft(id: string, patch: Partial<AdminFeedPost>) {
    setPosts((current) => current.map((post) => (post.id === id ? { ...post, ...patch } : post)));
  }

  function updatePlacementDraft(id: string, patch: Partial<AdminPlacement>) {
    setPlacements((current) => current.map((placement) => (placement.id === id ? { ...placement, ...patch } : placement)));
  }

  async function savePost(post: AdminFeedPost, patch: Partial<AdminFeedPost> = {}) {
    const payload = { ...post, ...patch };
    setSavingKey(`post-${post.id}`);
    setNotice(null);
    setError(null);

    try {
      const data = await requestJson(`/api/admin/feed/posts/${post.id}`, {
        status: payload.status,
        visibility: payload.visibility,
        isFeatured: payload.isFeatured,
        isPinned: payload.isPinned,
        moderationReason: payload.moderationReason,
      });
      const item = data.item as AdminFeedPost;
      setPosts((current) => {
        if (item.status === 'DELETED') return current.filter((entry) => entry.id !== item.id);
        return current.map((entry) => (entry.id === item.id ? item : entry));
      });
      setNotice(`Feed post updated: ${statusLabel(item.status)}.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to update feed post.');
    } finally {
      setSavingKey(null);
    }
  }

  async function savePlacement(placement: AdminPlacement, patch: Partial<AdminPlacement> = {}) {
    const payload = { ...placement, ...patch };
    setSavingKey(`placement-${placement.id}`);
    setNotice(null);
    setError(null);

    try {
      const data = await requestJson(`/api/admin/feed/placements/${placement.id}`, {
        status: payload.status,
        startsAt: toDateInput(payload.startsAt),
        endsAt: toDateInput(payload.endsAt),
        ctaLabel: payload.ctaLabel,
        ctaHref: payload.ctaHref,
        budgetAmount: payload.budgetAmount ?? '',
        impressionGoal: payload.impressionGoal ?? '',
        moderationNote: payload.moderationNote,
      });
      const item = data.item as AdminPlacement;
      setPlacements((current) => current.map((entry) => (entry.id === item.id ? item : entry)));
      setNotice(`Sponsor placement updated: ${statusLabel(item.status)}.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to update sponsor placement.');
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className="admin-feed-moderation">
      <section className="admin-feed-moderation-hero card">
        <div>
          <div className="section-kicker">Feed Moderation Center</div>
          <h2>Control what goes live in the Resurgence creator-commerce feed.</h2>
          <p className="section-copy">
            Review creator submissions, set visibility, feature or pin content, approve sponsor placements, and keep promoted feed inventory safe before it reaches the public site.
          </p>
        </div>
        <div className="admin-feed-moderation-kpis">
          <div><span>Post review</span><strong>{postCounts.pending}</strong></div>
          <div><span>Published posts</span><strong>{postCounts.published}</strong></div>
          <div><span>Pending placements</span><strong>{placementCounts.pending}</strong></div>
          <div><span>Approved / live</span><strong>{placementCounts.live}</strong></div>
        </div>
      </section>

      {notice ? <div className="notice success">{notice}</div> : null}
      {error ? <div className="notice error">{error}</div> : null}

      <section className="card admin-feed-section">
        <div className="admin-feed-section-header">
          <div>
            <div className="section-kicker">Creator Content</div>
            <h3>Posts awaiting review and visibility decisions</h3>
          </div>
          <a className="button-link btn-secondary" href="/feed">Preview Public Feed</a>
        </div>

        {posts.length ? (
          <div className="admin-feed-post-grid">
            {posts.map((post) => {
              const media = post.media[0];
              const saving = savingKey === `post-${post.id}`;

              return (
                <article className="admin-feed-post-card" key={post.id}>
                  <div className="admin-feed-post-media">
                    {media?.thumbnailUrl || media?.url ? <img src={media.thumbnailUrl || media.url} alt={media.altText || post.caption} /> : <span>No media</span>}
                  </div>
                  <div className="admin-feed-post-body">
                    <div className="admin-feed-row-top">
                      <span className={`admin-feed-status status-${post.status.toLowerCase().replace(/_/g, '-')}`}>{statusLabel(post.status)}</span>
                      <span>{post.creator?.name || post.author?.displayName || 'Unknown creator'}</span>
                      <span>{formatDate(post.updatedAt)}</span>
                    </div>
                    <h4>{post.caption}</h4>
                    <div className="admin-feed-tags">
                      {post.hashtags.slice(0, 5).map((tag) => <span key={tag.id}>{tag.label}</span>)}
                      {post.productTags.length ? <span>{post.productTags.length} merch tag{post.productTags.length === 1 ? '' : 's'}</span> : null}
                      {post.placementCount ? <span>{post.placementCount} sponsor placement{post.placementCount === 1 ? '' : 's'}</span> : null}
                    </div>
                    <div className="admin-feed-metrics">
                      <span>{formatCompact(post.metrics.views)} views</span>
                      <span>{formatCompact(post.metrics.likes)} likes</span>
                      <span>{formatCompact(post.metrics.comments)} comments</span>
                      <span>{formatCompact(post.metrics.saves)} saves</span>
                    </div>

                    <div className="admin-feed-controls">
                      <label>
                        <span className="helper">Status</span>
                        <select className="input" value={post.status} onChange={(event) => updatePostDraft(post.id, { status: event.target.value as AdminFeedPost['status'] })}>
                          {postStatuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
                        </select>
                      </label>
                      <label>
                        <span className="helper">Visibility</span>
                        <select className="input" value={post.visibility} onChange={(event) => updatePostDraft(post.id, { visibility: event.target.value as AdminFeedPost['visibility'] })}>
                          {postVisibilities.map((visibility) => <option key={visibility} value={visibility}>{statusLabel(visibility)}</option>)}
                        </select>
                      </label>
                    </div>

                    <div className="admin-feed-toggle-row">
                      <label><input type="checkbox" checked={post.isFeatured} onChange={(event) => updatePostDraft(post.id, { isFeatured: event.target.checked })} /> Featured</label>
                      <label><input type="checkbox" checked={post.isPinned} onChange={(event) => updatePostDraft(post.id, { isPinned: event.target.checked })} /> Pinned</label>
                    </div>

                    <label>
                      <span className="helper">Moderation note</span>
                      <textarea className="input" rows={3} value={post.moderationReason} onChange={(event) => updatePostDraft(post.id, { moderationReason: event.target.value })} placeholder="Optional reason for hiding, archiving, or requesting changes" />
                    </label>

                    <div className="admin-feed-actions">
                      <button className="btn btn-secondary" type="button" disabled={saving} onClick={() => savePost(post)}>{saving ? 'Saving...' : 'Save'}</button>
                      <button className="btn" type="button" disabled={saving} onClick={() => savePost(post, { status: 'PUBLISHED', visibility: 'PUBLIC' })}>Publish</button>
                      <button className="btn btn-secondary" type="button" disabled={saving} onClick={() => savePost(post, { status: 'HIDDEN' })}>Hide</button>
                      <button className="btn btn-secondary" type="button" disabled={saving} onClick={() => savePost(post, { status: 'ARCHIVED' })}>Archive</button>
                      <button className="btn btn-secondary" type="button" disabled={saving} onClick={() => window.confirm('Soft delete this feed post?') && savePost(post, { status: 'DELETED' })}>Delete</button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="admin-feed-empty">
            <h4>No feed posts yet.</h4>
            <p className="section-copy">Creator submissions will appear here after creators start posting from `/creator/posts`.</p>
          </div>
        )}
      </section>

      <section className="card admin-feed-section">
        <div className="admin-feed-section-header">
          <div>
            <div className="section-kicker">Sponsor Placements</div>
            <h3>Review promoted feed requests before they go live</h3>
          </div>
          <a className="button-link btn-secondary" href="/sponsor/placements">Sponsor View</a>
        </div>

        {placements.length ? (
          <div className="admin-feed-placement-stack">
            {placements.map((placement) => {
              const saving = savingKey === `placement-${placement.id}`;

              return (
                <article className="admin-feed-placement-card" key={placement.id}>
                  <div className="admin-feed-row-top">
                    <span className={`admin-feed-status status-${placement.status.toLowerCase()}`}>{statusLabel(placement.status)}</span>
                    <span>{placement.sponsorProfile?.companyName || placement.sponsor?.name || 'Sponsor'}</span>
                    <span>{statusLabel(placement.placementType)}</span>
                  </div>
                  <h4>{placement.title}</h4>
                  <div className="admin-feed-tags">
                    <span>{placement.post ? `Post: ${placement.post.creatorName || 'Creator'} - ${placement.post.caption.slice(0, 70)}` : 'No feed post attached'}</span>
                    <span>{placement.product ? `Merch: ${placement.product.name}` : 'No merch attached'}</span>
                    <span>{placement.ctaHref ? `CTA: ${placement.ctaLabel || 'Open link'}` : 'No CTA link'}</span>
                  </div>
                  <div className="admin-feed-metrics">
                    <span>{formatCurrency(placement.budgetAmount)}</span>
                    <span>{formatCompact(placement.impressionGoal)} impression goal</span>
                    <span>{formatCompact(placement.impressionCount)} impressions</span>
                    <span>{formatCompact(placement.clickCount)} clicks</span>
                  </div>

                  <div className="admin-feed-placement-controls">
                    <label>
                      <span className="helper">Status</span>
                      <select className="input" value={placement.status} onChange={(event) => updatePlacementDraft(placement.id, { status: event.target.value as AdminPlacement['status'] })}>
                        {placementStatuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}
                      </select>
                    </label>
                    <label>
                      <span className="helper">CTA label</span>
                      <input className="input" value={placement.ctaLabel} onChange={(event) => updatePlacementDraft(placement.id, { ctaLabel: event.target.value })} />
                    </label>
                    <label>
                      <span className="helper">CTA URL</span>
                      <input className="input" value={placement.ctaHref} onChange={(event) => updatePlacementDraft(placement.id, { ctaHref: event.target.value })} />
                    </label>
                    <label>
                      <span className="helper">Start</span>
                      <input className="input" type="datetime-local" value={toDateInput(placement.startsAt)} onChange={(event) => updatePlacementDraft(placement.id, { startsAt: event.target.value || null })} />
                    </label>
                    <label>
                      <span className="helper">End</span>
                      <input className="input" type="datetime-local" value={toDateInput(placement.endsAt)} onChange={(event) => updatePlacementDraft(placement.id, { endsAt: event.target.value || null })} />
                    </label>
                    <label>
                      <span className="helper">Budget</span>
                      <input className="input" type="number" min="0" value={placement.budgetAmount ?? ''} onChange={(event) => updatePlacementDraft(placement.id, { budgetAmount: event.target.value ? Number(event.target.value) : null })} />
                    </label>
                    <label>
                      <span className="helper">Goal</span>
                      <input className="input" type="number" min="0" value={placement.impressionGoal ?? ''} onChange={(event) => updatePlacementDraft(placement.id, { impressionGoal: event.target.value ? Number(event.target.value) : null })} />
                    </label>
                  </div>

                  <label>
                    <span className="helper">Admin moderation note</span>
                    <textarea className="input" rows={3} value={placement.moderationNote} onChange={(event) => updatePlacementDraft(placement.id, { moderationNote: event.target.value })} placeholder="Optional approval, rejection, or scheduling note" />
                  </label>

                  <div className="admin-feed-actions">
                    <button className="btn btn-secondary" type="button" disabled={saving} onClick={() => savePlacement(placement)}>{saving ? 'Saving...' : 'Save'}</button>
                    <button className="btn" type="button" disabled={saving} onClick={() => savePlacement(placement, { status: 'APPROVED' })}>Approve</button>
                    <button className="btn" type="button" disabled={saving} onClick={() => savePlacement(placement, { status: 'ACTIVE' })}>Activate</button>
                    <button className="btn btn-secondary" type="button" disabled={saving} onClick={() => savePlacement(placement, { status: 'PAUSED' })}>Pause</button>
                    <button className="btn btn-secondary" type="button" disabled={saving} onClick={() => savePlacement(placement, { status: 'REJECTED' })}>Reject</button>
                    <button className="btn btn-secondary" type="button" disabled={saving} onClick={() => savePlacement(placement, { status: 'CANCELLED' })}>Cancel</button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="admin-feed-empty">
            <h4>No sponsor placement requests yet.</h4>
            <p className="section-copy">Sponsor requests will appear here after sponsors submit them from `/sponsor/placements`.</p>
          </div>
        )}
      </section>
    </div>
  );
}
