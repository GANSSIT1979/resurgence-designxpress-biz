'use client';

import { useState } from 'react';

type SponsorPlacementStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';

type SponsorPlacementItem = {
  id: string;
  title: string;
  placementType: string;
  status: SponsorPlacementStatus;
  startsAt: string | null;
  endsAt: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  budgetAmount: number | null;
  impressionGoal: number | null;
  impressionCount: number;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
  sponsorName: string | null;
  post: {
    id: string;
    caption: string;
    summary: string | null;
    publishedAt: string | null;
    creatorName: string | null;
  } | null;
  product: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    price: number;
  } | null;
};

type FeedPostOption = {
  id: string;
  caption: string;
  creatorName: string | null;
  publishedAt: string | null;
};

type ProductOption = {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string | null;
};

type PlacementForm = {
  title: string;
  placementType: string;
  postId: string;
  productId: string;
  startsAt: string;
  endsAt: string;
  ctaLabel: string;
  ctaHref: string;
  budgetAmount: string;
  impressionGoal: string;
};

const defaultForm: PlacementForm = {
  title: '',
  placementType: 'FEED_PROMOTION',
  postId: '',
  productId: '',
  startsAt: '',
  endsAt: '',
  ctaLabel: 'Learn more',
  ctaHref: '',
  budgetAmount: '',
  impressionGoal: '',
};

const placementTypes = [
  { value: 'FEED_PROMOTION', label: 'Feed promotion' },
  { value: 'MERCH_SPOTLIGHT', label: 'Merch spotlight' },
  { value: 'CREATOR_COLLAB', label: 'Creator collaboration' },
  { value: 'EVENT_ACTIVATION', label: 'Event activation' },
];

function formatDate(value: string | null) {
  if (!value) return 'Not scheduled';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not scheduled';

  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function formatDateInput(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function formatCurrency(value: number | null) {
  if (!value) return 'Budget pending';
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value ?? 0);
}

function statusLabel(status: string) {
  return status
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function hydrateForm(item: SponsorPlacementItem): PlacementForm {
  return {
    title: item.title,
    placementType: item.placementType || 'FEED_PROMOTION',
    postId: item.post?.id || '',
    productId: item.product?.id || '',
    startsAt: formatDateInput(item.startsAt),
    endsAt: formatDateInput(item.endsAt),
    ctaLabel: item.ctaLabel || '',
    ctaHref: item.ctaHref || '',
    budgetAmount: item.budgetAmount ? String(item.budgetAmount) : '',
    impressionGoal: item.impressionGoal ? String(item.impressionGoal) : '',
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

  if (!response.ok) throw new Error(data.error || 'Unable to complete the request.');
  return data;
}

export function SponsorPlacementManager({
  sponsorName,
  initialPlacements,
  posts,
  products,
}: {
  sponsorName: string;
  initialPlacements: SponsorPlacementItem[];
  posts: FeedPostOption[];
  products: ProductOption[];
}) {
  const [placements, setPlacements] = useState(initialPlacements);
  const [form, setForm] = useState(defaultForm);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const selected = placements.find((item) => item.id === selectedId) ?? null;
  const pendingCount = placements.filter((item) => item.status === 'PENDING').length;
  const liveCount = placements.filter((item) => ['APPROVED', 'ACTIVE'].includes(item.status)).length;
  const totalImpressions = placements.reduce((sum, item) => sum + item.impressionCount, 0);
  const totalClicks = placements.reduce((sum, item) => sum + item.clickCount, 0);

  function updateForm<K extends keyof PlacementForm>(key: K, value: PlacementForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setSelectedId(null);
    setForm(defaultForm);
    setNotice(null);
    setError(null);
  }

  function editPlacement(item: SponsorPlacementItem) {
    setSelectedId(item.id);
    setForm(hydrateForm(item));
    setNotice(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function buildPayload(status: 'DRAFT' | 'PENDING' | 'CANCELLED') {
    return {
      title: form.title,
      placementType: form.placementType,
      status,
      postId: form.postId,
      productId: form.productId,
      startsAt: form.startsAt,
      endsAt: form.endsAt,
      ctaLabel: form.ctaLabel,
      ctaHref: form.ctaHref,
      budgetAmount: form.budgetAmount,
      impressionGoal: form.impressionGoal,
    };
  }

  async function savePlacement(status: 'DRAFT' | 'PENDING') {
    setSaving(true);
    setNotice(null);
    setError(null);

    try {
      const url = selectedId ? `/api/sponsor/placements/${selectedId}` : '/api/sponsor/placements';
      const method = selectedId ? 'PUT' : 'POST';
      const data = await requestJson(url, {
        method,
        body: JSON.stringify(buildPayload(status)),
      });
      const item = data.item as SponsorPlacementItem;

      setPlacements((current) => {
        if (selectedId) return current.map((placement) => (placement.id === item.id ? item : placement));
        return [item, ...current];
      });
      setSelectedId(item.id);
      setForm(hydrateForm(item));
      setNotice(status === 'DRAFT' ? 'Placement draft saved.' : 'Placement request submitted for admin review.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save placement request.');
    } finally {
      setSaving(false);
    }
  }

  async function cancelPlacement(item: SponsorPlacementItem) {
    if (!window.confirm('Cancel this feed placement request?')) return;

    setCancelingId(item.id);
    setNotice(null);
    setError(null);

    try {
      const data = await requestJson(`/api/sponsor/placements/${item.id}`, { method: 'DELETE' });
      const updated = data.item as SponsorPlacementItem;
      setPlacements((current) => current.map((placement) => (placement.id === updated.id ? updated : placement)));
      if (selectedId === updated.id) setForm(hydrateForm(updated));
      setNotice('Placement request cancelled.');
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : 'Unable to cancel placement request.');
    } finally {
      setCancelingId(null);
    }
  }

  return (
    <div className="sponsor-placement-manager">
      <section className="sponsor-placement-hero card">
        <div>
          <div className="section-kicker">Sponsor Feed Placements</div>
          <h2>Request promoted moments inside the Resurgence creator-commerce feed.</h2>
          <p className="section-copy">
            Plan sponsored feed placements around creator content, official merch, campaign CTAs, and measurable impression goals. Requests stay pending until the Resurgence admin team approves them.
          </p>
        </div>
        <div className="sponsor-placement-identity">
          <span>Sponsor account</span>
          <strong>{sponsorName}</strong>
          <a className="button-link btn-secondary" href="/feed">Preview Feed</a>
        </div>
      </section>

      <section className="sponsor-placement-kpis">
        <div className="sponsor-placement-kpi"><span>Total requests</span><strong>{placements.length}</strong></div>
        <div className="sponsor-placement-kpi"><span>Pending review</span><strong>{pendingCount}</strong></div>
        <div className="sponsor-placement-kpi"><span>Approved / Live</span><strong>{liveCount}</strong></div>
        <div className="sponsor-placement-kpi"><span>Impressions</span><strong>{formatNumber(totalImpressions)}</strong></div>
        <div className="sponsor-placement-kpi"><span>Clicks</span><strong>{formatNumber(totalClicks)}</strong></div>
      </section>

      <div className="sponsor-placement-grid">
        <section className="card sponsor-placement-form">
          <div className="sponsor-placement-form-header">
            <div>
              <div className="section-kicker">{selected ? 'Edit Request' : 'New Placement Request'}</div>
              <h3>{selected ? selected.title : 'Create sponsor placement'}</h3>
            </div>
            {selected ? <button className="btn btn-secondary" type="button" onClick={resetForm}>New Request</button> : null}
          </div>

          {notice ? <div className="notice success">{notice}</div> : null}
          {error ? <div className="notice error">{error}</div> : null}

          <label>
            <span className="helper">Campaign title</span>
            <input className="input" value={form.title} onChange={(event) => updateForm('title', event.target.value)} placeholder="Example: Summer merch launch with Jake Anilao" />
          </label>

          <div className="sponsor-placement-two-col">
            <label>
              <span className="helper">Placement type</span>
              <select className="input" value={form.placementType} onChange={(event) => updateForm('placementType', event.target.value)}>
                {placementTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label>
              <span className="helper">CTA label</span>
              <input className="input" value={form.ctaLabel} onChange={(event) => updateForm('ctaLabel', event.target.value)} placeholder="Shop now, Learn more, Apply today" />
            </label>
          </div>

          <label>
            <span className="helper">Attach public feed post</span>
            <select className="input" value={form.postId} onChange={(event) => updateForm('postId', event.target.value)}>
              <option value="">No specific feed post</option>
              {posts.map((post) => (
                <option key={post.id} value={post.id}>
                  {(post.creatorName || 'Creator')} - {post.caption.slice(0, 90)}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="helper">Attach official merch</span>
            <select className="input" value={form.productId} onChange={(event) => updateForm('productId', event.target.value)}>
              <option value="">No merch product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.name} - {formatCurrency(product.price)}</option>
              ))}
            </select>
          </label>

          <label>
            <span className="helper">CTA URL</span>
            <input className="input" value={form.ctaHref} onChange={(event) => updateForm('ctaHref', event.target.value)} placeholder="https://resurgence-dx.biz/shop or campaign landing page" />
          </label>

          <div className="sponsor-placement-two-col">
            <label>
              <span className="helper">Start date</span>
              <input className="input" type="datetime-local" value={form.startsAt} onChange={(event) => updateForm('startsAt', event.target.value)} />
            </label>
            <label>
              <span className="helper">End date</span>
              <input className="input" type="datetime-local" value={form.endsAt} onChange={(event) => updateForm('endsAt', event.target.value)} />
            </label>
          </div>

          <div className="sponsor-placement-two-col">
            <label>
              <span className="helper">Budget amount (PHP)</span>
              <input className="input" type="number" min="0" value={form.budgetAmount} onChange={(event) => updateForm('budgetAmount', event.target.value)} placeholder="Optional" />
            </label>
            <label>
              <span className="helper">Impression goal</span>
              <input className="input" type="number" min="0" value={form.impressionGoal} onChange={(event) => updateForm('impressionGoal', event.target.value)} placeholder="Optional" />
            </label>
          </div>

          <p className="helper">
            Requests are analytics-ready. Impression and click counters are reserved for the moderation and tracking slices, so current values may stay at zero until active placement tracking is enabled.
          </p>

          <div className="sponsor-placement-actions">
            <button className="btn btn-secondary" type="button" disabled={saving} onClick={() => savePlacement('DRAFT')}>{saving ? 'Saving...' : 'Save Draft'}</button>
            <button className="btn" type="button" disabled={saving} onClick={() => savePlacement('PENDING')}>{saving ? 'Submitting...' : 'Submit for Review'}</button>
          </div>
        </section>

        <section className="card sponsor-placement-list">
          <div className="section-kicker">Placement Requests</div>
          <h3 style={{ marginTop: 0 }}>Campaign pipeline</h3>
          {placements.length ? (
            <div className="sponsor-placement-stack">
              {placements.map((item) => (
                <article className={selectedId === item.id ? 'sponsor-placement-row active' : 'sponsor-placement-row'} key={item.id}>
                  <div className="sponsor-placement-row-top">
                    <span className={`sponsor-placement-status status-${item.status.toLowerCase()}`}>{statusLabel(item.status)}</span>
                    <span>{statusLabel(item.placementType)}</span>
                  </div>
                  <h4>{item.title}</h4>
                  <div className="sponsor-placement-targets">
                    <span>{item.post ? `Post: ${item.post.creatorName || 'Creator'} - ${item.post.caption.slice(0, 68)}` : 'No feed post attached'}</span>
                    <span>{item.product ? `Merch: ${item.product.name}` : 'No merch attached'}</span>
                    <span>{item.ctaHref ? `CTA: ${item.ctaLabel || 'Open link'}` : 'No CTA link'}</span>
                  </div>
                  <div className="sponsor-placement-metrics">
                    <span>{formatCurrency(item.budgetAmount)}</span>
                    <span>{formatNumber(item.impressionGoal)} goal</span>
                    <span>{formatNumber(item.impressionCount)} impressions</span>
                    <span>{formatNumber(item.clickCount)} clicks</span>
                  </div>
                  <div className="helper">Schedule: {formatDate(item.startsAt)} to {formatDate(item.endsAt)}</div>
                  <div className="btn-row">
                    <button className="btn btn-secondary" type="button" onClick={() => editPlacement(item)}>Edit</button>
                    <button className="btn btn-secondary" type="button" disabled={cancelingId === item.id || item.status === 'CANCELLED'} onClick={() => cancelPlacement(item)}>
                      {cancelingId === item.id ? 'Canceling...' : 'Cancel'}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="sponsor-placement-empty">
              <div className="section-kicker">Empty State</div>
              <h4>No feed placement requests yet.</h4>
              <p className="section-copy">Start with a campaign title, optional feed post or merch product, CTA link, and target dates. Save as draft or submit for admin review.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
