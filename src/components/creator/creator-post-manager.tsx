'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import { FilterChipRow } from '@/components/filter-chip-row';
import { ImageUploadField } from '@/components/image-upload-field';
import type { FeedMediaType, FeedPost } from '@/lib/feed/types';

type CreatorProductOption = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  price: string | number | null;
  stock: number | null;
};

type PostFormState = {
  caption: string;
  summary: string;
  visibility: 'PUBLIC' | 'MEMBERS_ONLY' | 'PRIVATE';
  mediaType: FeedMediaType;
  mediaUrl: string;
  thumbnailUrl: string;
  altText: string;
  mediaCaption: string;
  hashtags: string;
  productIds: string[];
};

const defaultForm: PostFormState = {
  caption: '',
  summary: '',
  visibility: 'PUBLIC',
  mediaType: 'IMAGE',
  mediaUrl: '',
  thumbnailUrl: '',
  altText: '',
  mediaCaption: '',
  hashtags: 'resurgence, basketball',
  productIds: [],
};

function formatDate(value: string | null | undefined) {
  if (!value) return 'Not yet published';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not yet published';

  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function formatPeso(value: string | number | null) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount) || amount <= 0) return 'Price pending';

  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(amount);
}

function statusLabel(status: string) {
  return status
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function hydrateForm(post: FeedPost): PostFormState {
  const media = post.mediaAssets[0];

  return {
    caption: post.caption,
    summary: post.summary ?? '',
    visibility: post.visibility as PostFormState['visibility'],
    mediaType: media?.mediaType ?? 'IMAGE',
    mediaUrl: media?.url ?? '',
    thumbnailUrl: media?.thumbnailUrl ?? '',
    altText: media?.altText ?? '',
    mediaCaption: media?.caption ?? '',
    hashtags: post.hashtags.map((tag) => tag.label.replace(/^#/, '')).join(', '),
    productIds: post.productTags.map((tag) => tag.productId).filter(Boolean) as string[],
  };
}

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

export function CreatorPostManager({
  creatorName,
  initialPosts,
  products,
  publicProfileHref,
}: {
  creatorName: string;
  initialPosts: FeedPost[];
  products: CreatorProductOption[];
  publicProfileHref: string;
}) {
  const [posts, setPosts] = useState(initialPosts);
  const [form, setForm] = useState<PostFormState>(defaultForm);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [libraryFilter, setLibraryFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const selectedPost = posts.find((post) => post.id === selectedId) ?? null;
  const publishedCount = posts.filter((post) => post.status === 'PUBLISHED').length;
  const pendingCount = posts.filter((post) => post.status === 'PENDING_REVIEW').length;
  const draftCount = posts.filter((post) => post.status === 'DRAFT').length;
  const totalEngagement = posts.reduce((sum, post) => sum + post.metrics.likes + post.metrics.comments + post.metrics.saves + post.metrics.shares, 0);
  const deferredSearch = useDeferredValue(search);
  const filteredPosts = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();

    return posts.filter((post) => {
      const matchesFilter = libraryFilter === 'ALL' || post.status === libraryFilter;
      const matchesSearch = !query || [
        post.caption,
        post.summary || '',
        ...post.hashtags.map((tag) => tag.label),
        ...post.productTags.map((tag) => tag.name),
      ].join(' ').toLowerCase().includes(query);

      return matchesFilter && matchesSearch;
    });
  }, [deferredSearch, libraryFilter, posts]);
  const previewProducts = products.filter((product) => form.productIds.includes(product.id));

  function updateForm<K extends keyof PostFormState>(key: K, value: PostFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setSelectedId(null);
    setForm(defaultForm);
    setNotice(null);
    setError(null);
  }

  function editPost(post: FeedPost) {
    setSelectedId(post.id);
    setForm(hydrateForm(post));
    setNotice(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function buildPayload(status?: 'DRAFT' | 'PENDING_REVIEW') {
    const mediaUrl = form.mediaUrl.trim();
    const hashtags = form.hashtags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    return {
      caption: form.caption.trim(),
      summary: form.summary.trim(),
      visibility: form.visibility,
      ...(status ? { status } : {}),
      mediaAssets: [
        {
          mediaType: form.mediaType,
          url: mediaUrl,
          thumbnailUrl: form.thumbnailUrl.trim(),
          altText: form.altText.trim(),
          caption: form.mediaCaption.trim(),
          sortOrder: 0,
        },
      ],
      hashtags,
      productIds: form.productIds,
    };
  }

  async function savePost(status?: 'DRAFT' | 'PENDING_REVIEW') {
    setIsSaving(true);
    setNotice(null);
    setError(null);

    try {
      const method = selectedId ? 'PATCH' : 'POST';
      const url = selectedId ? `/api/feed/${selectedId}` : '/api/feed';
      const payload = buildPayload(status ?? (selectedId ? undefined : 'PENDING_REVIEW'));
      const data = await requestJson(url, {
        method,
        body: JSON.stringify(payload),
      });
      const item = data.item as FeedPost | null;

      if (!item) throw new Error('The post saved, but the server did not return the updated post.');

      setPosts((current) => {
        if (selectedId) return current.map((post) => (post.id === item.id ? item : post));
        return [item, ...current];
      });
      setSelectedId(item.id);
      setForm(hydrateForm(item));
      setNotice(status === 'DRAFT' ? 'Draft saved.' : status === 'PENDING_REVIEW' ? 'Post submitted for review.' : 'Post updated.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save post.');
    } finally {
      setIsSaving(false);
    }
  }

  async function deletePost(post: FeedPost) {
    if (!window.confirm('Delete this feed post? It will be removed from creator management and hidden from the public feed.')) return;

    setDeletingId(post.id);
    setNotice(null);
    setError(null);

    try {
      await requestJson(`/api/feed/${post.id}`, { method: 'DELETE' });
      setPosts((current) => current.filter((item) => item.id !== post.id));
      if (selectedId === post.id) resetForm();
      setNotice('Post deleted.');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unable to delete post.');
    } finally {
      setDeletingId(null);
    }
  }

  function renderPostCard(post: FeedPost, compact = false) {
    const media = post.mediaAssets[0];

    return (
      <article
        key={post.id}
        className={[
          'creator-post-row',
          compact ? 'compact' : '',
          selectedId === post.id ? 'active' : '',
        ].filter(Boolean).join(' ')}
      >
        <div className="creator-post-thumb">
          {media?.thumbnailUrl || media?.url ? <img src={media.thumbnailUrl || media.url} alt={media.altText || post.caption} /> : <span>No media</span>}
        </div>
        <div className="creator-post-row-body">
          <div className="creator-post-row-top">
            <span className={`creator-post-status status-${post.status.toLowerCase().replace(/_/g, '-')}`}>{statusLabel(post.status)}</span>
            <span>{formatDate(post.publishedAt || post.updatedAt)}</span>
          </div>
          <h4>{post.caption}</h4>
          <div className="creator-post-tags">
            {post.hashtags.slice(0, 4).map((tag) => (
              <span key={tag.id}>{tag.label}</span>
            ))}
            {post.productTags.length ? <span>{post.productTags.length} merch tag{post.productTags.length === 1 ? '' : 's'}</span> : null}
          </div>
          <div className="creator-post-metrics">
            <span>{post.metrics.views} views</span>
            <span>{post.metrics.likes} likes</span>
            <span>{post.metrics.comments} comments</span>
            <span>{post.metrics.saves} saves</span>
            <span>{post.metrics.shares} shares</span>
          </div>
          <div className="btn-row">
            <button className="btn btn-secondary" type="button" onClick={() => editPost(post)}>
              Edit
            </button>
            <button className="btn btn-secondary" type="button" disabled={deletingId === post.id} onClick={() => deletePost(post)}>
              {deletingId === post.id ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <div className="creator-post-manager">
      <section className="creator-post-hero card">
        <div>
          <div className="section-kicker">Creator Feed Studio</div>
          <h2>Publish basketball stories, merch drops, and sponsor-ready reels.</h2>
          <p className="section-copy">
            Manage your Resurgence feed content from one place. Creator submissions enter review before they appear publicly, while drafts stay private until you are ready.
          </p>
        </div>
        <div className="creator-post-hero-actions">
          <a className="button-link" href="/feed">View Live Feed</a>
          <a className="button-link btn-secondary" href={publicProfileHref}>Public Profile</a>
        </div>
      </section>

      <section className="creator-post-kpis">
        <div className="creator-post-kpi">
          <span>Total posts</span>
          <strong>{posts.length}</strong>
        </div>
        <div className="creator-post-kpi">
          <span>Published</span>
          <strong>{publishedCount}</strong>
        </div>
        <div className="creator-post-kpi">
          <span>In review</span>
          <strong>{pendingCount}</strong>
        </div>
        <div className="creator-post-kpi">
          <span>Drafts</span>
          <strong>{draftCount}</strong>
        </div>
        <div className="creator-post-kpi">
          <span>Engagement</span>
          <strong>{totalEngagement}</strong>
        </div>
      </section>

      <section className="card creator-post-toolbar">
        <div>
          <div className="section-kicker">Content Studio Tools</div>
          <h3>Filter the library and switch your view</h3>
        </div>
        <input
          className="input"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search captions, hashtags, or tagged merch"
        />
        <FilterChipRow
          items={[
            { value: 'ALL', label: 'All posts' },
            { value: 'PUBLISHED', label: 'Published' },
            { value: 'PENDING_REVIEW', label: 'In review' },
            { value: 'DRAFT', label: 'Drafts' },
          ]}
          selected={libraryFilter}
          onChange={(value) => setLibraryFilter(String(value))}
        />
        <div className="creator-post-view-toggle">
          <button className={viewMode === 'list' ? 'active' : ''} type="button" onClick={() => setViewMode('list')}>
            List View
          </button>
          <button className={viewMode === 'grid' ? 'active' : ''} type="button" onClick={() => setViewMode('grid')}>
            Grid View
          </button>
        </div>
      </section>

      <div className="creator-post-grid">
        <section className="creator-post-form card">
          <div className="creator-post-form-header">
            <div>
              <div className="section-kicker">{selectedPost ? 'Edit Post' : 'New Post'}</div>
              <h3>{selectedPost ? selectedPost.caption.slice(0, 72) : `Create as ${creatorName}`}</h3>
            </div>
            {selectedPost ? (
              <button className="btn btn-secondary" type="button" onClick={resetForm}>
                New Post
              </button>
            ) : null}
          </div>

          {notice ? <div className="notice success">{notice}</div> : null}
          {error ? <div className="notice error">{error}</div> : null}

          <label>
            <span className="helper">Caption</span>
            <textarea
              className="input"
              value={form.caption}
              onChange={(event) => updateForm('caption', event.target.value)}
              placeholder="Tell the story behind the play, creator moment, merch drop, or sponsor activation."
              rows={6}
            />
          </label>

          <label>
            <span className="helper">Short summary</span>
            <input
              className="input"
              value={form.summary}
              onChange={(event) => updateForm('summary', event.target.value)}
              placeholder="Optional one-line summary for cards and previews"
            />
          </label>

          <div className="creator-post-two-col">
            <label>
              <span className="helper">Visibility</span>
              <select className="input" value={form.visibility} onChange={(event) => updateForm('visibility', event.target.value as PostFormState['visibility'])}>
                <option value="PUBLIC">Public</option>
                <option value="MEMBERS_ONLY">Members only</option>
                <option value="PRIVATE">Private</option>
              </select>
            </label>
            <label>
              <span className="helper">Media type</span>
              <select className="input" value={form.mediaType} onChange={(event) => updateForm('mediaType', event.target.value as FeedMediaType)}>
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Direct video</option>
                <option value="YOUTUBE">YouTube</option>
                <option value="VIMEO">Vimeo</option>
                <option value="EXTERNAL">External link</option>
              </select>
            </label>
          </div>

          {form.mediaType === 'IMAGE' ? (
            <ImageUploadField
              label="Primary image"
              scope="creator"
              value={form.mediaUrl}
              onChange={(value) => updateForm('mediaUrl', value)}
              helper="Upload a square or vertical image, or paste an existing image URL. Videos can be added by changing the media type above."
            />
          ) : (
            <label>
              <span className="helper">Media URL</span>
              <input
                className="input"
                value={form.mediaUrl}
                onChange={(event) => updateForm('mediaUrl', event.target.value)}
                placeholder="Paste a video, YouTube, Vimeo, or external media URL"
              />
            </label>
          )}

          <div className="creator-post-two-col">
            <label>
              <span className="helper">Thumbnail URL</span>
              <input className="input" value={form.thumbnailUrl} onChange={(event) => updateForm('thumbnailUrl', event.target.value)} placeholder="Optional preview image" />
            </label>
            <label>
              <span className="helper">Media alt text</span>
              <input className="input" value={form.altText} onChange={(event) => updateForm('altText', event.target.value)} placeholder="Describe the media for accessibility" />
            </label>
          </div>

          <label>
            <span className="helper">Media caption</span>
            <input className="input" value={form.mediaCaption} onChange={(event) => updateForm('mediaCaption', event.target.value)} placeholder="Optional caption for the uploaded media" />
          </label>

          <label>
            <span className="helper">Hashtags</span>
            <input className="input" value={form.hashtags} onChange={(event) => updateForm('hashtags', event.target.value)} placeholder="resurgence, basketball, merchdrop" />
          </label>

          <label>
            <span className="helper">Tagged merch</span>
            <select
              className="input creator-product-select"
              multiple
              value={form.productIds}
              onChange={(event) => updateForm('productIds', Array.from(event.currentTarget.selectedOptions).map((option) => option.value))}
            >
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} - {formatPeso(product.price)}
                </option>
              ))}
            </select>
          </label>
          <p className="helper">Hold Ctrl or Cmd to select multiple merch products. Product CTAs reuse the existing shop and checkout flow.</p>

          {previewProducts.length ? (
            <div className="creator-post-selected-products">
              {previewProducts.map((product) => (
                <span key={product.id}>
                  {product.name} - {formatPeso(product.price)}
                </span>
              ))}
            </div>
          ) : null}

          <section className="creator-post-preview">
            <div className="section-kicker">Draft Preview</div>
            <h4>{form.caption.trim() || 'Your next story headline appears here.'}</h4>
            <p className="helper">{form.summary.trim() || 'Add a short summary so cards and creator surfaces stay readable.'}</p>
            <div className="creator-post-preview-media">
              {form.thumbnailUrl || form.mediaUrl ? (
                <img src={form.thumbnailUrl || form.mediaUrl} alt={form.altText || form.caption || 'Draft preview'} />
              ) : (
                <div className="creator-post-preview-empty">Preview updates after you add media.</div>
              )}
            </div>
            <div className="creator-post-tags">
              {form.hashtags
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean)
                .slice(0, 4)
                .map((tag) => (
                  <span key={tag}>#{tag.replace(/^#/, '')}</span>
                ))}
            </div>
          </section>

          <div className="creator-post-actions">
            <button className="btn btn-secondary" type="button" disabled={isSaving} onClick={() => savePost('DRAFT')}>
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            {selectedPost ? (
              <button className="btn btn-secondary" type="button" disabled={isSaving} onClick={() => savePost()}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            ) : null}
            <button className="btn" type="button" disabled={isSaving} onClick={() => savePost('PENDING_REVIEW')}>
              {isSaving ? 'Submitting...' : 'Submit for Review'}
            </button>
          </div>
          <div className="notice success">
            Scheduling-ready pattern: save drafts first, then submit for review when the post, merch links, and caption are ready for the live feed.
          </div>
        </section>

        <section className="creator-post-list card">
          <div className="creator-post-form-header">
            <div>
              <div className="section-kicker">Your Feed Library</div>
              <h3>Posts and performance</h3>
            </div>
          </div>

          {filteredPosts.length ? (
            viewMode === 'grid' ? (
              <div className="creator-post-card-grid">
                {filteredPosts.map((post) => renderPostCard(post, true))}
              </div>
            ) : (
              <div className="creator-post-stack">
                {filteredPosts.map((post) => renderPostCard(post))}
              </div>
            )
          ) : (
            <div className="creator-post-empty">
              <div className="section-kicker">Empty State</div>
              <h4>No posts match the current view.</h4>
              <p className="section-copy">Try a different filter or start with a game highlight, training story, or merch announcement. Your first post can stay as a draft until it is ready for review.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
