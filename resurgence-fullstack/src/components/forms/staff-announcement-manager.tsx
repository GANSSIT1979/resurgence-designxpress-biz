'use client';

import { useMemo, useState } from 'react';

type AnnouncementItem = {
  id: string;
  title: string;
  body: string;
  level: string;
  isPinned: boolean;
  publishAt: string | null;
};

const initialState = {
  title: '',
  body: '',
  level: 'INFO',
  isPinned: false,
  publishAt: '',
};

export function StaffAnnouncementManager({ initialItems }: { initialItems: AnnouncementItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState(initialState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    if (!filter) return items;
    const query = filter.toLowerCase();
    return items.filter((item) => [item.title, item.level, item.body].some((value) => value.toLowerCase().includes(query)));
  }, [filter, items]);

  function resetForm() {
    setForm(initialState);
    setEditingId(null);
  }

  function hydrateForm(item: AnnouncementItem) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      body: item.body,
      level: item.level,
      isPinned: item.isPinned,
      publishAt: item.publishAt ? item.publishAt.slice(0, 16) : '',
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setError(null);

    const response = await fetch(editingId ? `/api/staff/announcements/${editingId}` : '/api/staff/announcements', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to save announcement.');
      return;
    }

    if (editingId) {
      setItems((current) => current.map((item) => (item.id === editingId ? data.item : item)));
      setNotice('Announcement updated.');
    } else {
      setItems((current) => [data.item, ...current]);
      setNotice('Announcement created.');
    }

    resetForm();
  }

  async function removeItem(id: string) {
    setNotice(null);
    setError(null);

    const response = await fetch(`/api/staff/announcements/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to delete announcement.');
      return;
    }

    setItems((current) => current.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
    setNotice('Announcement deleted.');
  }

  return (
    <div className="card-grid grid-2">
      <section className="card">
        <div className="section-kicker">Announcement Desk</div>
        <h2 style={{ marginTop: 0 }}>{editingId ? 'Update Announcement' : 'Create Announcement'}</h2>
        {notice ? <div className="notice success" style={{ marginTop: 18 }}>{notice}</div> : null}
        {error ? <div className="notice error" style={{ marginTop: 18 }}>{error}</div> : null}
        <form className="form-grid" style={{ marginTop: 18 }} onSubmit={onSubmit}>
          <input className="input" placeholder="Announcement title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea className="textarea" placeholder="Announcement body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} required />
          <select className="input" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
            <option value="INFO">Info</option>
            <option value="SUCCESS">Success</option>
            <option value="WARNING">Warning</option>
            <option value="URGENT">Urgent</option>
          </select>
          <input className="input" type="datetime-local" value={form.publishAt} onChange={(e) => setForm({ ...form, publishAt: e.target.value })} />
          <label className="helper" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="checkbox" checked={form.isPinned} onChange={(e) => setForm({ ...form, isPinned: e.target.checked })} />
            Pin this announcement to the top of the staff feed
          </label>
          <div className="btn-row">
            <button className="btn" type="submit">{editingId ? 'Update Announcement' : 'Create Announcement'}</button>
            {editingId ? <button className="btn btn-secondary" type="button" onClick={resetForm}>Cancel Edit</button> : null}
          </div>
        </form>
      </section>

      <section className="card">
        <div className="section-kicker">Announcement Feed</div>
        <input className="input" style={{ marginBottom: 16 }} placeholder="Search title, level, or body" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Announcement</th>
                <th>Level</th>
                <th>Publish</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.title}</strong>
                    {item.isPinned ? <div className="helper">Pinned announcement</div> : null}
                  </td>
                  <td>{item.level}</td>
                  <td>{item.publishAt ? item.publishAt.replace('T', ' ').slice(0, 16) : 'Immediate'}</td>
                  <td>
                    <div className="btn-row">
                      <button className="btn btn-secondary" type="button" onClick={() => hydrateForm(item)}>Edit</button>
                      <button className="btn btn-secondary" type="button" onClick={() => removeItem(item.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredItems.length ? <tr><td colSpan={4}><span className="helper">No announcements found.</span></td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
