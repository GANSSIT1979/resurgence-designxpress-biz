'use client';

import { useState } from 'react';

type ContentItem = {
  id: string;
  key: string;
  title: string;
  subtitle: string | null;
  body: string;
  ctaLabel: string | null;
  ctaHref: string | null;
};

export function ContentManager({ initialContent }: { initialContent: ContentItem[] }) {
  const [items, setItems] = useState(initialContent);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ key: '', title: '', subtitle: '', body: '', ctaLabel: '', ctaHref: '' });

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

    setItems((current) => current.map((entry) => (entry.id === item.id ? data.item : entry)));
    setNotice(`Saved ${item.key}.`);
  }

  async function deleteItem(id: string) {
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

    setItems((current) => [data.item, ...current]);
    setNewItem({ key: '', title: '', subtitle: '', body: '', ctaLabel: '', ctaHref: '' });
    setNotice(`Created ${data.item.key}.`);
  }

  return (
    <div className="card-grid">
      <section className="card">
        <div className="section-kicker">Content CMS</div>
        <h2 style={{ marginBottom: 8 }}>Create Content Section</h2>
        <p className="helper">Each entry can power a section heading, body copy, and call-to-action anywhere on the site.</p>
        <form className="form-grid" style={{ marginTop: 18 }} onSubmit={createItem}>
          {notice ? <div className="notice success">{notice}</div> : null}
          {error ? <div className="notice error">{error}</div> : null}
          <input className="input" placeholder="Key (example: home.hero)" value={newItem.key} onChange={(e) => setNewItem({ ...newItem, key: e.target.value })} required />
          <input className="input" placeholder="Title" value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} required />
          <input className="input" placeholder="Subtitle" value={newItem.subtitle} onChange={(e) => setNewItem({ ...newItem, subtitle: e.target.value })} />
          <textarea className="textarea" placeholder="Body" value={newItem.body} onChange={(e) => setNewItem({ ...newItem, body: e.target.value })} required />
          <input className="input" placeholder="CTA label" value={newItem.ctaLabel} onChange={(e) => setNewItem({ ...newItem, ctaLabel: e.target.value })} />
          <input className="input" placeholder="CTA href" value={newItem.ctaHref} onChange={(e) => setNewItem({ ...newItem, ctaHref: e.target.value })} />
          <button className="btn" type="submit">Create Content</button>
        </form>
      </section>

      {items.map((item, index) => (
        <EditableContentCard
          key={item.id}
          item={item}
          index={index}
          onSave={saveItem}
          onDelete={deleteItem}
        />
      ))}
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

  return (
    <section className="card">
      <div className="section-kicker">Entry {String(index + 1).padStart(2, '0')}</div>
      <div className="form-grid">
        <input className="input" value={local.key} onChange={(e) => setLocal({ ...local, key: e.target.value })} />
        <input className="input" value={local.title} onChange={(e) => setLocal({ ...local, title: e.target.value })} />
        <input className="input" value={local.subtitle ?? ''} onChange={(e) => setLocal({ ...local, subtitle: e.target.value })} />
        <textarea className="textarea" value={local.body} onChange={(e) => setLocal({ ...local, body: e.target.value })} />
        <input className="input" value={local.ctaLabel ?? ''} onChange={(e) => setLocal({ ...local, ctaLabel: e.target.value })} />
        <input className="input" value={local.ctaHref ?? ''} onChange={(e) => setLocal({ ...local, ctaHref: e.target.value })} />
        <div className="btn-row">
          <button className="btn" type="button" onClick={() => onSave(local)}>Save Changes</button>
          <button className="btn btn-secondary" type="button" onClick={() => onDelete(local.id)}>Delete</button>
        </div>
      </div>
    </section>
  );
}
