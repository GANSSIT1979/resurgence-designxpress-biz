'use client';

import { useState } from 'react';
import { ImageUploadField } from '@/components/image-upload-field';

type CreatorProfile = {
  id: string;
  name: string;
  slug: string;
  roleLabel: string;
  platformFocus: string;
  audience: string;
  biography: string | null;
  journeyStory: string | null;
  pointsPerGame: number | null;
  assistsPerGame: number | null;
  reboundsPerGame: number | null;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
};

const initialState = {
  name: '',
  slug: '',
  roleLabel: '',
  platformFocus: '',
  audience: '',
  biography: '',
  journeyStory: '',
  pointsPerGame: 0,
  assistsPerGame: 0,
  reboundsPerGame: 0,
  imageUrl: '',
  sortOrder: 0,
  isActive: true,
};

export function CreatorProfileManager({ initialItems }: { initialItems: CreatorProfile[] }) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState(initialState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function resetForm() {
    setForm(initialState);
    setEditingId(null);
  }

  function hydrateForm(item: CreatorProfile) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      slug: item.slug,
      roleLabel: item.roleLabel,
      platformFocus: item.platformFocus,
      audience: item.audience,
      biography: item.biography || '',
      journeyStory: item.journeyStory || '',
      pointsPerGame: item.pointsPerGame || 0,
      assistsPerGame: item.assistsPerGame || 0,
      reboundsPerGame: item.reboundsPerGame || 0,
      imageUrl: item.imageUrl || '',
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setError(null);

    const response = await fetch(editingId ? `/api/admin/creator-network/${editingId}` : '/api/admin/creator-network', {
      method: editingId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to save creator profile.');
      return;
    }

    if (editingId) {
      setItems((current) => current.map((item) => (item.id === editingId ? data.item : item)));
      setNotice('Creator profile updated.');
    } else {
      setItems((current) => [data.item, ...current]);
      setNotice('Creator profile created.');
    }
    resetForm();
  }

  async function removeItem(id: string) {
    setNotice(null);
    setError(null);

    const response = await fetch(`/api/admin/creator-network/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to delete creator profile.');
      return;
    }

    setItems((current) => current.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
    setNotice('Creator profile deleted.');
  }

  return (
    <div className="card-grid grid-2">
      <section className="card">
        <div className="section-kicker">Creator Network CMS</div>
        <h2 style={{ marginTop: 0 }}>Manage Creator Profiles</h2>
        <p className="helper">Add biography, performance statistics, journey story, image, and dashboard identity for each creator.</p>

        {notice ? <div className="notice success" style={{ marginTop: 18 }}>{notice}</div> : null}
        {error ? <div className="notice error" style={{ marginTop: 18 }}>{error}</div> : null}

        <form className="form-grid" style={{ marginTop: 18 }} onSubmit={onSubmit}>
          <input className="input" placeholder="Creator name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input" placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
          <input className="input" placeholder="Role label" value={form.roleLabel} onChange={(e) => setForm({ ...form, roleLabel: e.target.value })} required />
          <ImageUploadField
            label="Creator profile image"
            value={form.imageUrl}
            scope="creator"
            helper="Upload a creator headshot, poster frame, or branded portrait for the public creator dashboard."
            onChange={(value) => setForm({ ...form, imageUrl: value })}
          />
          <textarea className="textarea" placeholder="Platform focus" value={form.platformFocus} onChange={(e) => setForm({ ...form, platformFocus: e.target.value })} required />
          <textarea className="textarea" placeholder="Audience description" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} required />
          <textarea className="textarea" placeholder="Biography" value={form.biography} onChange={(e) => setForm({ ...form, biography: e.target.value })} />
          <textarea className="textarea" placeholder="Journey story" value={form.journeyStory} onChange={(e) => setForm({ ...form, journeyStory: e.target.value })} />
          <input className="input" type="number" step="0.1" placeholder="Points per game" value={form.pointsPerGame} onChange={(e) => setForm({ ...form, pointsPerGame: Number(e.target.value) })} />
          <input className="input" type="number" step="0.1" placeholder="Assists per game" value={form.assistsPerGame} onChange={(e) => setForm({ ...form, assistsPerGame: Number(e.target.value) })} />
          <input className="input" type="number" step="0.1" placeholder="Rebounds per game" value={form.reboundsPerGame} onChange={(e) => setForm({ ...form, reboundsPerGame: Number(e.target.value) })} />
          <input className="input" type="number" placeholder="Sort order" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
          <label className="helper" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Creator is active
          </label>
          <div className="btn-row">
            <button className="btn" type="submit">{editingId ? 'Update Creator' : 'Create Creator'}</button>
            {editingId ? <button className="btn btn-secondary" type="button" onClick={resetForm}>Cancel Edit</button> : null}
          </div>
        </form>
      </section>

      <section className="card">
        <div className="section-kicker">Current Creator Roster</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Stats</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.name}</strong>
                    <div className="helper">/{item.slug}</div>
                    <div className="helper">{item.platformFocus}</div>
                  </td>
                  <td>{item.roleLabel}</td>
                  <td>
                    <div className="helper">PPG {item.pointsPerGame ?? 0}</div>
                    <div className="helper">APG {item.assistsPerGame ?? 0} • RPG {item.reboundsPerGame ?? 0}</div>
                  </td>
                  <td>
                    <div className="btn-row">
                      <button className="btn btn-secondary" type="button" onClick={() => hydrateForm(item)}>Edit</button>
                      <button className="btn btn-secondary" type="button" onClick={() => removeItem(item.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
