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

function getContentGroup(key: string): ContentGroupKey {
  if (key.startsWith('home.')) return 'home';
  if (key.startsWith('events.')) return 'events';
  if (key.startsWith('partnerships.')) return 'partnerships';
  if (key.startsWith('support.')) return 'support';
  return 'other';
}

function getGroupLabel(key: string) {
  const group = getContentGroup(key);
  return GROUPS.find((entry) => entry.key === group)?.label ?? 'Other';
}

function normalizeSearch(value: string) {
  return value.trim().toLowerCase();
}

export function ContentManager({ initialContent }: { initialContent: ContentItem[] }) {
  const [items, setItems] = useState(initialContent);
  const [activeGroup, setActiveGroup] = useState<ContentGroupKey>('all');
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newItem, setNewItem] = useState(EMPTY_FORM);

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

    if (!target) {
      setError('Content entry not found.');
      return;
    }

    const typedKey = window.prompt(`Type the CMS key to delete this entry:\n\n${target.key}`, '');

    if (typedKey !== target.key) {
      setNotice(null);
      setError('Delete cancelled. The typed CMS key did not match.');
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
    setNotice(`Deleted ${target.key}.`);
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

  const hasUnsavedChanges =
    local.key !== item.key ||
    local.title !== item.title ||
    (local.subtitle ?? '') !== (item.subtitle ?? '') ||
    local.body !== item.body ||
    (local.ctaLabel ?? '') !== (item.ctaLabel ?? '') ||
    (local.ctaHref ?? '') !== (item.ctaHref ?? '');

  return (
    <section className="card content-cms-entry-card">
      <div className="content-cms-entry-head">
        <div>
          <div className="section-kicker">Entry {String(index + 1).padStart(2, '0')}</div>
          <h3>{local.key || 'Untitled key'}</h3>
        </div>

        <div className="content-cms-entry-badges">
          <span className={`content-cms-group-pill content-cms-group-${group}`}>{getGroupLabel(local.key)}</span>
          <span className={`content-cms-dirty-pill ${hasUnsavedChanges ? 'is-dirty' : 'is-saved'}`}>
            {hasUnsavedChanges ? 'Unsaved changes' : 'Saved'}
          </span>
        </div>
      </div>

      <div className="content-cms-preview">
        <strong>{local.title || 'Untitled section'}</strong>
        {local.subtitle ? <span>{local.subtitle}</span> : null}
        <p>{local.body || 'No body copy yet.'}</p>
        {local.ctaLabel || local.ctaHref ? (
          <small>
            CTA: {local.ctaLabel || 'Untitled'} - {local.ctaHref || '#'}
          </small>
        ) : null}
      </div>

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
          <button className="btn" type="button" disabled={!hasUnsavedChanges} onClick={() => onSave(local)}>
            {hasUnsavedChanges ? 'Save Changes' : 'Saved'}
          </button>
          <button className="btn btn-secondary" type="button" disabled={!hasUnsavedChanges} onClick={() => setLocal(item)}>
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
