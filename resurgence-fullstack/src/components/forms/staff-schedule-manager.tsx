'use client';

import { useMemo, useState } from 'react';

type ScheduleItem = {
  id: string;
  title: string;
  location: string | null;
  startAt: string;
  endAt: string;
  notes: string | null;
};

const initialState = {
  title: '',
  location: '',
  startAt: '',
  endAt: '',
  notes: '',
};

export function StaffScheduleManager({ initialItems }: { initialItems: ScheduleItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState(initialState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    if (!filter) return items;
    const query = filter.toLowerCase();
    return items.filter((item) => [item.title, item.location ?? ''].some((value) => value.toLowerCase().includes(query)));
  }, [filter, items]);

  function resetForm() {
    setForm(initialState);
    setEditingId(null);
  }

  function hydrateForm(item: ScheduleItem) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      location: item.location || '',
      startAt: item.startAt.slice(0, 16),
      endAt: item.endAt.slice(0, 16),
      notes: item.notes || '',
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setError(null);

    const response = await fetch(editingId ? `/api/staff/schedule/${editingId}` : '/api/staff/schedule', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to save schedule item.');
      return;
    }

    if (editingId) {
      setItems((current) => current.map((item) => (item.id === editingId ? data.item : item)));
      setNotice('Schedule item updated.');
    } else {
      setItems((current) => [...current, data.item].sort((a, b) => a.startAt.localeCompare(b.startAt)));
      setNotice('Schedule item created.');
    }

    resetForm();
  }

  async function removeItem(id: string) {
    setNotice(null);
    setError(null);

    const response = await fetch(`/api/staff/schedule/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to delete schedule item.');
      return;
    }

    setItems((current) => current.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
    setNotice('Schedule item deleted.');
  }

  return (
    <div className="card-grid grid-2">
      <section className="card">
        <div className="section-kicker">Schedule Builder</div>
        <h2 style={{ marginTop: 0 }}>{editingId ? 'Update Schedule Item' : 'Create Schedule Item'}</h2>
        {notice ? <div className="notice success" style={{ marginTop: 18 }}>{notice}</div> : null}
        {error ? <div className="notice error" style={{ marginTop: 18 }}>{error}</div> : null}
        <form className="form-grid" style={{ marginTop: 18 }} onSubmit={onSubmit}>
          <input className="input" placeholder="Meeting or event title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input className="input" placeholder="Location / room / link" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <input className="input" type="datetime-local" value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} required />
          <input className="input" type="datetime-local" value={form.endAt} onChange={(e) => setForm({ ...form, endAt: e.target.value })} required />
          <textarea className="textarea" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <div className="btn-row">
            <button className="btn" type="submit">{editingId ? 'Update Item' : 'Create Item'}</button>
            {editingId ? <button className="btn btn-secondary" type="button" onClick={resetForm}>Cancel Edit</button> : null}
          </div>
        </form>
      </section>

      <section className="card">
        <div className="section-kicker">Upcoming Schedule</div>
        <input className="input" style={{ marginBottom: 16 }} placeholder="Search title or location" value={filter} onChange={(e) => setFilter(e.target.value)} />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Schedule</th>
                <th>Start</th>
                <th>End</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.title}</strong>
                    <div className="helper">{item.location || 'No location set'}</div>
                  </td>
                  <td>{item.startAt.replace('T', ' ').slice(0, 16)}</td>
                  <td>{item.endAt.replace('T', ' ').slice(0, 16)}</td>
                  <td>
                    <div className="btn-row">
                      <button className="btn btn-secondary" type="button" onClick={() => hydrateForm(item)}>Edit</button>
                      <button className="btn btn-secondary" type="button" onClick={() => removeItem(item.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredItems.length ? <tr><td colSpan={4}><span className="helper">No schedule items found.</span></td></tr> : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
