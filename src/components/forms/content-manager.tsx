'use client';

import { useMemo, useState } from 'react';

type ContentItem = {
  id: string;
  key: string;
  title: string;
  subtitle: string | null;
  body: string;
  ctaLabel: string | null;
  ctaHref: string | null;
};

type ContentGroupKey = 'all' | 'home' | 'events' | 'partnerships' | 'support' | 'other';

const GROUPS: Array<{ key: ContentGroupKey; label: string; description: string }> = [
  { key: 'all', label: 'All', description: 'Every CMS record' },
  { key: 'home', label: 'Home', description: 'Home hero and TikTok discovery cards' },
  { key: 'events', label: 'Events', description: 'Event landing and overview copy' },
  { key: 'partnerships', label: 'Partnerships', description: 'Partner-facing public copy' },
  { key: 'support', label: 'Support', description: 'Support desk and routing rules' },
  { key: 'other', label: 'Other', description: 'Uncategorized content keys' },
];

const EMPTY_FORM = {
  key: '',
  title: '',
  subtitle: '',
  body: '',
  ctaLabel: '',
  ctaHref: '',
};

const RECOMMENDED_CONTENT_KEYS = [
  {
    key: 'home.discovery.resurgence',
    group: 'home',
    title: 'Creator commerce, sponsor activations, and basketball culture in one feed.',
    subtitle: 'FOR YOU',
    body:
      'A mobile-first RESURGENCE experience for creators, merch drops, sponsors, basketball events, and community stories.',
    ctaLabel: 'Open Feed',
    ctaHref: '/feed',
  },
  {
    key: 'home.discovery.event',
    group: 'home',
    title: 'DAYO Series OFW All-Star 2026',
    subtitle: 'EVENT DROP',
    body:
      'Sponsor-ready basketball activation connecting OFW communities, brand partners, creator media, and event-day visibility.',
    ctaLabel: 'Open Event',
    ctaHref: '/events/dayo-series-ofw-all-star',
  },
  {
    key: 'home.discovery.creator',
    group: 'home',
    title: 'Creator-led commerce built for real community reach.',
    subtitle: 'CREATOR NETWORK',
    body:
      'Feature athletes, creators, coaches, sponsors, and community storytellers in one mobile-first discovery feed.',
    ctaLabel: 'View Creators',
    ctaHref: '/creators',
  },
  {
    key: 'home.discovery.shop',
    group: 'home',
    title: 'Merch, uniforms, apparel, and branded team gear.',
    subtitle: 'SHOP DROP',
    body:
      'Browse official drops and route custom apparel needs into DesignXpress production workflows.',
    ctaLabel: 'Open Shop',
    ctaHref: '/shop',
  },
  {
    key: 'events.hero',
    group: 'events',
    title: 'Sponsorship-ready events, community activations, and creator moments.',
    subtitle: 'RESURGENCE Events',
    body:
      'Explore official RESURGENCE event pages, review sponsorship opportunities, and apply for packages connected to each activation.',
    ctaLabel: 'View Sponsor Packages',
    ctaHref: '/sponsors',
  },
  {
    key: 'events.overview',
    group: 'events',
    title: 'Choose an event to open its sponsor landing page.',
    subtitle: 'Active Event Catalog',
    body:
      'Official RESURGENCE event pages connect sponsors, creators, basketball communities, team operations, media visibility, and activation opportunities.',
    ctaLabel: 'Open Events',
    ctaHref: '/events',
  },
  {
    key: 'partnerships.hero',
    group: 'partnerships',
    title: 'Build partnerships that connect brands, creators, merch, and community sports.',
    subtitle: 'Partnerships',
    body:
      'RESURGENCE Powered by DesignXpress gives sponsors, partners, affiliates, creators, merchants, and community organizers a structured business entry point for collaborations.',
    ctaLabel: 'Start Partnership Inquiry',
    ctaHref: '/contact',
  },
  {
    key: 'partnerships.paths',
    group: 'partnerships',
    title: 'Choose the partnership route that fits your business goal.',
    subtitle: 'Partnership Paths',
    body:
      'Route sponsorships, referrals, branded apparel programs, creator collaborations, media partnerships, and larger commercial opportunities into the right workflow.',
    ctaLabel: 'View Sponsor Packages',
    ctaHref: '/sponsors',
  },
  {
    key: 'support.hero',
    group: 'support',
    title: 'Live support desk for RESURGENCE customers, sponsors, creators, and partners.',
    subtitle: 'Support Desk',
    body:
      'Get help with sponsorships, shop orders, payments, basketball events, custom apparel, creator activity, partnerships, and human follow-up.',
    ctaLabel: 'Email Support',
    ctaHref: 'mailto:support@resurgence-dx.biz',
  },
  {
    key: 'support.routing',
    group: 'support',
    title: 'Comprehensive help topics with accurate handoff rules.',
    subtitle: 'Support Routing',
    body:
      'Support routes visitors into the right workflow for sponsorships, shop orders, payments, events, custom apparel, creator questions, partnership inquiries, and general platform help.',
    ctaLabel: 'Open Support Desk',
    ctaHref: '/support',
  },
  {
    key: 'support.rules',
    group: 'support',
    title: 'Accurate answers, safe routing, and clear next steps.',
    subtitle: 'Support Rules',
    body:
      'RESURGENCE support should use only confirmed business information, avoid inventing prices or commitments, protect payment privacy, and collect complete contact details when a request needs review.',
    ctaLabel: 'Contact Support',
    ctaHref: '/contact',
  },
] as const;

function getContentGroup(key: string): ContentGroupKey {
  if (key.startsWith('home.')) return 'home';
  if (key.startsWith('events.')) return 'events';
  if (key.startsWith('partnerships.')) return 'partnerships';
  if (key.startsWith('support.')) return 'support';
  return 'other';
}

function getGroupLabel(key: string) {
  const group = GROUPS.find((item) => item.key === getContentGroup(key));
  return group?.label ?? 'Other';
}

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

function getCtaHrefType(href?: string | null) {
  const value = href?.trim();

  if (!value) return { label: 'No CTA', status: 'empty', isOpenable: false } as const;
  if (value.startsWith('/')) return { label: 'Internal route', status: 'valid', isOpenable: true } as const;
  if (value.startsWith('mailto:')) return { label: 'Email link', status: 'valid', isOpenable: true } as const;
  if (value.startsWith('https://') || value.startsWith('http://')) {
    return { label: 'External URL', status: 'valid', isOpenable: true } as const;
  }

  return { label: 'Check CTA href', status: 'warning', isOpenable: false } as const;
}

function getContentHealth(item: ContentItem) {
  const issues: string[] = [];

  if (!item.key.trim()) issues.push('Missing key');
  if (!item.title.trim()) issues.push('Missing title');
  if (!item.body.trim()) issues.push('Missing body');

  const cta = getCtaHrefType(item.ctaHref);
  if (cta.status === 'warning') issues.push('CTA href should start with /, mailto:, http://, or https://');

  return {
    status: issues.length ? 'warning' : 'ready',
    label: issues.length ? `${issues.length} issue${issues.length === 1 ? '' : 's'}` : 'Ready',
    issues,
  };
}

export function ContentManager({ initialContent }: { initialContent: ContentItem[] }) {
  const [items, setItems] = useState(initialContent);
  const [activeGroup, setActiveGroup] = useState<ContentGroupKey>('all');
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newItem, setNewItem] = useState(EMPTY_FORM);

  const existingKeys = useMemo(() => new Set(items.map((item) => item.key)), [items]);

  const missingRecommendedKeys = useMemo(
    () => RECOMMENDED_CONTENT_KEYS.filter((item) => !existingKeys.has(item.key)),
    [existingKeys],
  );

  const groupCounts = useMemo(() => {
    const counts: Record<ContentGroupKey, number> = {
      all: items.length,
      home: 0,
      events: 0,
      partnerships: 0,
      support: 0,
      other: 0,
    };

    items.forEach((item) => {
      counts[getContentGroup(item.key)] += 1;
    });

    return counts;
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = normalizeSearch(search);

    return items
      .filter((item) => activeGroup === 'all' || getContentGroup(item.key) === activeGroup)
      .filter((item) => {
        if (!query) return true;

        return [item.key, item.title, item.subtitle, item.body, item.ctaLabel, item.ctaHref]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      })
      .sort((left, right) => left.key.localeCompare(right.key));
  }, [activeGroup, items, search]);

  async function saveItem(item: ContentItem) {
    setNotice(null);
    setError(null);

    const response = await fetch(`/api/admin/content/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to update content.');
      return;
    }

    setItems((current) =>
      current
        .map((entry) => (entry.id === item.id ? data.item : entry))
        .sort((left, right) => left.key.localeCompare(right.key)),
    );
    setNotice(`Saved ${item.key}.`);
  }

  async function deleteItem(id: string) {
    const target = items.find((item) => item.id === id);

    if (target && !window.confirm(`Delete CMS entry "${target.key}"?`)) {
      return;
    }

    setNotice(null);
    setError(null);

    const response = await fetch(`/api/admin/content/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to delete content.');
      return;
    }

    setItems((current) => current.filter((entry) => entry.id !== id));
    setNotice('Content entry deleted.');
  }

  async function createItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setError(null);

    const response = await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to create content entry.');
      return;
    }

    setItems((current) => [data.item, ...current].sort((left, right) => left.key.localeCompare(right.key)));
    setNewItem(EMPTY_FORM);
    setActiveGroup(getContentGroup(data.item.key));
    setNotice(`Created ${data.item.key}.`);
  }

  async function createRecommendedItem(seed: (typeof RECOMMENDED_CONTENT_KEYS)[number]) {
    setNotice(null);
    setError(null);

    const response = await fetch('/api/admin/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: seed.key,
        title: seed.title,
        subtitle: seed.subtitle,
        body: seed.body,
        ctaLabel: seed.ctaLabel,
        ctaHref: seed.ctaHref,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || `Unable to create ${seed.key}.`);
      return;
    }

    setItems((current) => [data.item, ...current].sort((left, right) => left.key.localeCompare(right.key)));
    setActiveGroup(getContentGroup(data.item.key));
    setNotice(`Created recommended key ${data.item.key}.`);
  }

  return (
    <div className="content-cms-shell">
      <section className="card content-cms-hero">
        <div>
          <div className="section-kicker">Content CMS</div>
          <h2>Manage public copy, TikTok discovery cards, and page CTAs.</h2>
          <p className="helper">
            Grouped controls for home, event, partnership, and support content. Existing API routes are preserved.
          </p>
        </div>

        <div className="content-cms-summary-grid">
          {GROUPS.filter((group) => group.key !== 'all').map((group) => (
            <button
              className={`content-cms-summary-card ${activeGroup === group.key ? 'active' : ''}`}
              key={group.key}
              type="button"
              onClick={() => setActiveGroup(group.key)}
            >
              <strong>{groupCounts[group.key]}</strong>
              <span>{group.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="card content-cms-recommended-card">
        <div className="content-cms-card-header">
          <div>
            <div className="section-kicker">Recommended Keys</div>
            <h3>Public CMS setup checklist</h3>
            <p className="helper">
              Quickly create missing CMS records for home discovery cards, events, partnerships, and support pages.
            </p>
          </div>
          <strong>{missingRecommendedKeys.length} missing</strong>
        </div>

        {missingRecommendedKeys.length ? (
          <div className="content-cms-recommended-grid">
            {missingRecommendedKeys.map((seed) => (
              <button
                className="content-cms-recommended-item"
                key={seed.key}
                type="button"
                onClick={() => createRecommendedItem(seed)}
              >
                <span>{seed.group}</span>
                <strong>{seed.key}</strong>
                <small>{seed.title}</small>
              </button>
            ))}
          </div>
        ) : (
          <div className="content-cms-complete-state">All recommended public CMS keys already exist.</div>
        )}
      </section>

      <section className="card content-cms-create-card">
        <div className="content-cms-card-header">
          <div>
            <div className="section-kicker">Create Entry</div>
            <h3>Create Content Section</h3>
            <p className="helper">
              Use namespaced keys like <code>home.discovery.resurgence</code>, <code>events.hero</code>, or{' '}
              <code>support.routing</code>.
            </p>
          </div>
        </div>

        <form className="form-grid content-cms-form-grid" onSubmit={createItem}>
          {notice ? <div className="notice success content-cms-span-all">{notice}</div> : null}
          {error ? <div className="notice error content-cms-span-all">{error}</div> : null}

          <label className="content-cms-field">
            <span>Key</span>
            <input
              className="input"
              placeholder="home.discovery.resurgence"
              value={newItem.key}
              onChange={(event) => setNewItem({ ...newItem, key: event.target.value })}
              required
            />
          </label>

          <label className="content-cms-field">
            <span>Title</span>
            <input
              className="input"
              placeholder="Section title"
              value={newItem.title}
              onChange={(event) => setNewItem({ ...newItem, title: event.target.value })}
              required
            />
          </label>

          <label className="content-cms-field">
            <span>Subtitle</span>
            <input
              className="input"
              placeholder="Optional eyebrow/subtitle"
              value={newItem.subtitle}
              onChange={(event) => setNewItem({ ...newItem, subtitle: event.target.value })}
            />
          </label>

          <label className="content-cms-field">
            <span>CTA Label</span>
            <input
              className="input"
              placeholder="Open Feed"
              value={newItem.ctaLabel}
              onChange={(event) => setNewItem({ ...newItem, ctaLabel: event.target.value })}
            />
          </label>

          <label className="content-cms-field content-cms-span-all">
            <span>Body</span>
            <textarea
              className="textarea"
              placeholder="Public body copy"
              value={newItem.body}
              onChange={(event) => setNewItem({ ...newItem, body: event.target.value })}
              required
            />
          </label>

          <label className="content-cms-field content-cms-span-all">
            <span>CTA Href</span>
            <input
              className="input"
              placeholder="/feed"
              value={newItem.ctaHref}
              onChange={(event) => setNewItem({ ...newItem, ctaHref: event.target.value })}
            />
          </label>

          <div className="btn-row content-cms-span-all">
            <button className="btn" type="submit">
              Create Content
            </button>
          </div>
        </form>
      </section>

      <section className="card content-cms-toolbar">
        <div>
          <div className="section-kicker">Library</div>
          <h3>{filteredItems.length} editable records</h3>
        </div>

        <input
          className="input"
          placeholder="Search key, title, body, or CTA..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />

        <div className="content-cms-filter-row">
          {GROUPS.map((group) => (
            <button
              className={`content-cms-filter-chip ${activeGroup === group.key ? 'active' : ''}`}
              key={group.key}
              type="button"
              onClick={() => setActiveGroup(group.key)}
              title={group.description}
            >
              {group.label}
              <span>{groupCounts[group.key]}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="content-cms-entry-grid">
        {filteredItems.length ? (
          filteredItems.map((item, index) => (
            <EditableContentCard key={item.id} item={item} index={index} onSave={saveItem} onDelete={deleteItem} />
          ))
        ) : (
          <section className="card empty-state">No content records match the current filter.</section>
        )}
      </div>
    </div>
  );
}

function EditableContentCard({
  item,
  index,
  onSave,
  onDelete,
}: {
  item: ContentItem;
  index: number;
  onSave: (item: ContentItem) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [local, setLocal] = useState(item);
  const group = getContentGroup(local.key);
  const ctaHrefType = getCtaHrefType(local.ctaHref);
  const health = getContentHealth(local);

  return (
    <section className="card content-cms-entry-card">
      <div className="content-cms-entry-head">
        <div>
          <div className="section-kicker">Entry {String(index + 1).padStart(2, '0')}</div>
          <h3>{local.key || 'Untitled key'}</h3>
        </div>

        <div className="content-cms-entry-badges">
          <span className={`content-cms-group-pill content-cms-group-${group}`}>{getGroupLabel(local.key)}</span>
          <span className={`content-cms-status-pill content-cms-status-${health.status}`}>{health.label}</span>
        </div>
      </div>

      <div className="content-cms-preview">
        <strong>{local.title || 'Untitled section'}</strong>
        {local.subtitle ? <span>{local.subtitle}</span> : null}
        <p>{local.body || 'No body copy yet.'}</p>
        <div className="content-cms-cta-preview">
          <small>
            CTA: {local.ctaLabel || 'Untitled'} → {local.ctaHref || '#'}
          </small>
          <span className={`content-cms-cta-type content-cms-cta-${ctaHrefType.status}`}>
            {ctaHrefType.label}
          </span>
          {ctaHrefType.isOpenable && local.ctaHref ? (
            <a href={local.ctaHref} target="_blank" rel="noreferrer">
              Open CTA
            </a>
          ) : null}
        </div>
      </div>

      {health.issues.length ? (
        <div className="content-cms-issue-list">
          {health.issues.map((issue) => (
            <span key={issue}>{issue}</span>
          ))}
        </div>
      ) : null}

      <div className="form-grid content-cms-edit-grid">
        <label className="content-cms-field">
          <span>Key</span>
          <input className="input" value={local.key} onChange={(event) => setLocal({ ...local, key: event.target.value })} />
        </label>

        <label className="content-cms-field">
          <span>Title</span>
          <input className="input" value={local.title} onChange={(event) => setLocal({ ...local, title: event.target.value })} />
        </label>

        <label className="content-cms-field">
          <span>Subtitle</span>
          <input
            className="input"
            value={local.subtitle ?? ''}
            onChange={(event) => setLocal({ ...local, subtitle: event.target.value })}
          />
        </label>

        <label className="content-cms-field">
          <span>CTA Label</span>
          <input
            className="input"
            value={local.ctaLabel ?? ''}
            onChange={(event) => setLocal({ ...local, ctaLabel: event.target.value })}
          />
        </label>

        <label className="content-cms-field content-cms-span-all">
          <span>Body</span>
          <textarea className="textarea" value={local.body} onChange={(event) => setLocal({ ...local, body: event.target.value })} />
        </label>

        <label className="content-cms-field content-cms-span-all">
          <span>CTA Href</span>
          <input
            className="input"
            value={local.ctaHref ?? ''}
            onChange={(event) => setLocal({ ...local, ctaHref: event.target.value })}
          />
        </label>

        <div className="btn-row content-cms-span-all">
          <button className="btn" type="button" onClick={() => onSave(local)}>
            Save Changes
          </button>
          <button className="btn btn-secondary" type="button" onClick={() => setLocal(item)}>
            Reset
          </button>
          <button className="btn btn-secondary" type="button" onClick={() => onDelete(local.id)}>
            Delete
          </button>
        </div>
      </div>
    </section>
  );
}
