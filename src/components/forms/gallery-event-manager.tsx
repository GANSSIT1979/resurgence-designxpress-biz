'use client';

import { useMemo, useState } from 'react';

type CreatorOption = { id: string; label: string };
type GalleryMediaItem = {
  id: string;
  mediaType: string;
  url: string;
  thumbnailUrl: string | null;
  caption: string | null;
  sortOrder: number;
};
type GalleryEvent = {
  id: string;
  title: string;
  description: string | null;
  eventDate: string | null;
  creatorId: string | null;
  sortOrder: number;
  isActive: boolean;
  mediaItems: GalleryMediaItem[];
};

const emptyEvent = {
  title: '',
  description: '',
  eventDate: '',
  creatorId: '',
  sortOrder: 0,
  isActive: true,
};

const emptyMedia = {
  mediaEventId: '',
  mediaType: 'IMAGE',
  url: '',
  thumbnailUrl: '',
  caption: '',
  sortOrder: 0,
};

export function GalleryEventManager({ initialItems, creators }: { initialItems: GalleryEvent[]; creators: CreatorOption[] }) {
  const [items, setItems] = useState(initialItems);
  const [eventForm, setEventForm] = useState(emptyEvent);
  const [mediaForm, setMediaForm] = useState(emptyMedia);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingMediaId, setEditingMediaId] = useState<string | null>(null);
  const [activeEventId, setActiveEventId] = useState<string | null>(initialItems[0]?.id ?? null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => [item.title, item.description || ''].join(' ').toLowerCase().includes(q));
  }, [search, items]);

  const activeEvent = items.find((item) => item.id === activeEventId) || null;

  function resetEventForm() {
    setEventForm(emptyEvent);
    setEditingEventId(null);
  }

  function resetMediaForm(currentEventId?: string | null) {
    setMediaForm({ ...emptyMedia, mediaEventId: currentEventId || activeEventId || '' });
    setEditingMediaId(null);
  }

  function hydrateEvent(item: GalleryEvent) {
    setEditingEventId(item.id);
    setEventForm({
      title: item.title,
      description: item.description || '',
      eventDate: item.eventDate ? item.eventDate.slice(0, 10) : '',
      creatorId: item.creatorId || '',
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
    setActiveEventId(item.id);
    resetMediaForm(item.id);
  }

  function hydrateMedia(item: GalleryMediaItem) {
    setEditingMediaId(item.id);
    setMediaForm({
      mediaEventId: activeEventId || '',
      mediaType: item.mediaType,
      url: item.url,
      thumbnailUrl: item.thumbnailUrl || '',
      caption: item.caption || '',
      sortOrder: item.sortOrder,
    });
  }

  async function saveEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null); setError(null);
    const response = await fetch(editingEventId ? `/api/admin/media-events/${editingEventId}` : '/api/admin/media-events', {
      method: editingEventId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventForm),
    });
    const data = await response.json();
    if (!response.ok) { setError(data.error || 'Unable to save event.'); return; }
    if (editingEventId) {
      setItems((current) => current.map((item) => (item.id === editingEventId ? { ...item, ...data.item, mediaItems: item.mediaItems } : item)));
      setNotice('Gallery event updated.');
      setActiveEventId(editingEventId);
    } else {
      const next = { ...data.item, mediaItems: [] };
      setItems((current) => [...current, next].sort((a, b) => a.sortOrder - b.sortOrder));
      setNotice('Gallery event created.');
      setActiveEventId(next.id);
      resetMediaForm(next.id);
    }
    resetEventForm();
  }

  async function deleteEvent(id: string) {
    setNotice(null); setError(null);
    const response = await fetch(`/api/admin/media-events/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) { setError(data.error || 'Unable to delete event.'); return; }
    const remaining = items.filter((item) => item.id !== id);
    setItems(remaining);
    setActiveEventId(remaining[0]?.id ?? null);
    if (editingEventId === id) resetEventForm();
    resetMediaForm(remaining[0]?.id ?? null);
    setNotice('Gallery event deleted.');
  }

  async function saveMedia(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeEventId && !mediaForm.mediaEventId) { setError('Select or create an event first.'); return; }
    setNotice(null); setError(null);
    const payload = { ...mediaForm, mediaEventId: mediaForm.mediaEventId || activeEventId || '' };
    const response = await fetch(editingMediaId ? `/api/admin/gallery-media/${editingMediaId}` : '/api/admin/gallery-media', {
      method: editingMediaId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) { setError(data.error || 'Unable to save media item.'); return; }
    const targetEventId = payload.mediaEventId;
    setItems((current) => current.map((item) => {
      if (item.id !== targetEventId) return item;
      const mediaItems = editingMediaId
        ? item.mediaItems.map((media) => (media.id === editingMediaId ? data.item : media))
        : [...item.mediaItems, data.item].sort((a, b) => a.sortOrder - b.sortOrder);
      return { ...item, mediaItems };
    }));
    setNotice(editingMediaId ? 'Media item updated.' : 'Media item added.');
    resetMediaForm(targetEventId);
  }

  async function deleteMedia(id: string) {
    if (!activeEventId) return;
    setNotice(null); setError(null);
    const response = await fetch(`/api/admin/gallery-media/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) { setError(data.error || 'Unable to delete media item.'); return; }
    setItems((current) => current.map((item) => item.id === activeEventId ? { ...item, mediaItems: item.mediaItems.filter((media) => media.id !== id) } : item));
    if (editingMediaId === id) resetMediaForm(activeEventId);
    setNotice('Media item deleted.');
  }

  return (
    <div className="card-grid grid-2">
      <section className="card">
        <div className="section-kicker">Homepage Gallery CMS</div>
        <h2 style={{ marginTop: 0 }}>{editingEventId ? 'Update Gallery Event' : 'Create Gallery Event'}</h2>
        <p className="helper">Group homepage media into events, attach creators, and control ordering for the public gallery section.</p>
        {notice ? <div className="notice success" style={{ marginTop: 18 }}>{notice}</div> : null}
        {error ? <div className="notice error" style={{ marginTop: 18 }}>{error}</div> : null}
        <form className="form-grid" style={{ marginTop: 18 }} onSubmit={saveEvent}>
          <input className="input" placeholder="Event title" value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} required />
          <textarea className="textarea" placeholder="Event description" value={eventForm.description} onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })} />
          <input className="input" type="date" value={eventForm.eventDate} onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })} />
          <select className="select" value={eventForm.creatorId} onChange={(e) => setEventForm({ ...eventForm, creatorId: e.target.value })}>
            <option value="">No creator assigned</option>
            {creators.map((creator) => <option key={creator.id} value={creator.id}>{creator.label}</option>)}
          </select>
          <input className="input" type="number" min="0" placeholder="Sort order" value={eventForm.sortOrder} onChange={(e) => setEventForm({ ...eventForm, sortOrder: Number(e.target.value) })} />
          <label className="helper" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="checkbox" checked={eventForm.isActive} onChange={(e) => setEventForm({ ...eventForm, isActive: e.target.checked })} />
            Event is published on homepage
          </label>
          <div className="btn-row">
            <button className="btn" type="submit">{editingEventId ? 'Save Event' : 'Add New Event'}</button>
            {editingEventId ? <button className="btn btn-secondary" type="button" onClick={resetEventForm}>Cancel Edit</button> : null}
          </div>
        </form>

        <div className="section-kicker" style={{ marginTop: 24 }}>Gallery Events</div>
        <input className="input" style={{ marginTop: 12, marginBottom: 16 }} placeholder="Search events" value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="table-wrap">
          <table>
            <thead><tr><th>Event</th><th>Items</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} style={{ cursor: 'pointer', background: item.id === activeEventId ? 'rgba(77,192,255,0.08)' : 'transparent' }} onClick={() => { setActiveEventId(item.id); resetMediaForm(item.id); }}>
                  <td>
                    <strong>{item.title}</strong>
                    <div className="helper">{item.eventDate ? item.eventDate.slice(0, 10) : 'No date set'}</div>
                  </td>
                  <td>{item.mediaItems.length}</td>
                  <td>
                    <div className="btn-row">
                      <button className="btn btn-secondary" type="button" onClick={(e) => { e.stopPropagation(); hydrateEvent(item); }}>Edit</button>
                      <button className="btn btn-secondary" type="button" onClick={(e) => { e.stopPropagation(); deleteEvent(item.id); }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <div className="section-kicker">Event Media</div>
        <h2 style={{ marginTop: 0 }}>{activeEvent ? `Manage media for ${activeEvent.title}` : 'Select an event to add media'}</h2>
        {activeEvent ? (
          <>
            <form className="form-grid" style={{ marginTop: 18 }} onSubmit={saveMedia}>
              <select className="select" value={mediaForm.mediaType} onChange={(e) => setMediaForm({ ...mediaForm, mediaType: e.target.value })}>
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Video</option>
                <option value="YOUTUBE">YouTube</option>
                <option value="VIMEO">Vimeo</option>
              </select>
              <input className="input" placeholder="Media URL" value={mediaForm.url} onChange={(e) => setMediaForm({ ...mediaForm, url: e.target.value })} required />
              <input className="input" placeholder="Thumbnail URL (optional)" value={mediaForm.thumbnailUrl} onChange={(e) => setMediaForm({ ...mediaForm, thumbnailUrl: e.target.value })} />
              <input className="input" placeholder="Caption" value={mediaForm.caption} onChange={(e) => setMediaForm({ ...mediaForm, caption: e.target.value })} />
              <input className="input" type="number" min="0" placeholder="Sort order" value={mediaForm.sortOrder} onChange={(e) => setMediaForm({ ...mediaForm, sortOrder: Number(e.target.value) })} />
              <div className="btn-row">
                <button className="btn" type="submit">{editingMediaId ? 'Save Media' : 'Add Media'}</button>
                {editingMediaId ? <button className="btn btn-secondary" type="button" onClick={() => resetMediaForm(activeEvent.id)}>Cancel Edit</button> : null}
              </div>
            </form>
            <div className="table-wrap" style={{ marginTop: 18 }}>
              <table>
                <thead><tr><th>Type</th><th>URL</th><th>Actions</th></tr></thead>
                <tbody>
                  {activeEvent.mediaItems.map((item) => (
                    <tr key={item.id}>
                      <td>{item.mediaType}</td>
                      <td><span className="helper">{item.caption || item.url}</span></td>
                      <td>
                        <div className="btn-row">
                          <button className="btn btn-secondary" type="button" onClick={() => hydrateMedia(item)}>Edit</button>
                          <button className="btn btn-secondary" type="button" onClick={() => deleteMedia(item.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="empty-state">Create or select a gallery event first.</div>
        )}
      </section>
    </div>
  );
}
