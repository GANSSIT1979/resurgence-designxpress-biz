'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ImageUploadField } from '@/components/image-upload-field';
import {
  CreatorDisplayProfile,
  formatCreatorShortDate,
  formatDateInput,
  getCreatorStats,
  getLinkedCreatorSocials,
  parseFollowerCount,
  slugifyCreatorName,
} from '@/lib/creators';

type CreatorForm = {
  name: string;
  slug: string;
  roleLabel: string;
  platformFocus: string;
  audience: string;
  contactNumber: string;
  address: string;
  dateOfBirth: string;
  jobDescription: string;
  position: string;
  height: string;
  facebookPage: string;
  facebookFollowers: string;
  tiktokPage: string;
  tiktokFollowers: string;
  instagramPage: string;
  instagramFollowers: string;
  youtubePage: string;
  youtubeFollowers: string;
  trendingVideoUrl: string;
  shortBio: string;
  biography: string;
  journeyStory: string;
  pointsPerGame: number | '';
  assistsPerGame: number | '';
  reboundsPerGame: number | '';
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
  accountEmail: string;
  accountPassword: string;
};

const initialState: CreatorForm = {
  name: '',
  slug: '',
  roleLabel: '',
  platformFocus: '',
  audience: '',
  contactNumber: '',
  address: '',
  dateOfBirth: '',
  jobDescription: '',
  position: '',
  height: '',
  facebookPage: '',
  facebookFollowers: '',
  tiktokPage: '',
  tiktokFollowers: '',
  instagramPage: '',
  instagramFollowers: '',
  youtubePage: '',
  youtubeFollowers: '',
  trendingVideoUrl: '',
  shortBio: '',
  biography: '',
  journeyStory: '',
  pointsPerGame: '',
  assistsPerGame: '',
  reboundsPerGame: '',
  imageUrl: '',
  sortOrder: 0,
  isActive: true,
  accountEmail: '',
  accountPassword: '',
};

const platformFilters = [
  { value: 'all', label: 'All platforms' },
  { value: 'facebook', label: 'Has Facebook' },
  { value: 'tiktok', label: 'Has TikTok' },
  { value: 'instagram', label: 'Has Instagram' },
  { value: 'youtube', label: 'Has YouTube' },
] as const;

function toForm(item: CreatorDisplayProfile): CreatorForm {
  return {
    name: item.name,
    slug: item.slug,
    roleLabel: item.roleLabel || '',
    platformFocus: item.platformFocus || '',
    audience: item.audience || '',
    contactNumber: item.contactNumber || '',
    address: item.address || '',
    dateOfBirth: formatDateInput(item.dateOfBirth),
    jobDescription: item.jobDescription || item.platformFocus || '',
    position: item.position || '',
    height: item.height || '',
    facebookPage: item.facebookPage || '',
    facebookFollowers: item.facebookFollowers || '',
    tiktokPage: item.tiktokPage || '',
    tiktokFollowers: item.tiktokFollowers || '',
    instagramPage: item.instagramPage || '',
    instagramFollowers: item.instagramFollowers || '',
    youtubePage: item.youtubePage || '',
    youtubeFollowers: item.youtubeFollowers || '',
    trendingVideoUrl: item.trendingVideoUrl || '',
    shortBio: item.shortBio || '',
    biography: item.biography || '',
    journeyStory: item.journeyStory || '',
    pointsPerGame: item.pointsPerGame ?? '',
    assistsPerGame: item.assistsPerGame ?? '',
    reboundsPerGame: item.reboundsPerGame ?? '',
    imageUrl: item.imageUrl || '',
    sortOrder: item.sortOrder,
    isActive: item.isActive,
    accountEmail: item.user?.email || '',
    accountPassword: '',
  };
}

function totalFollowers(item: CreatorDisplayProfile) {
  return [item.facebookFollowers, item.tiktokFollowers, item.instagramFollowers, item.youtubeFollowers].reduce(
    (sum, value) => sum + parseFollowerCount(value),
    0,
  );
}

function hasPlatform(item: CreatorDisplayProfile, platform: string) {
  if (platform === 'facebook') return Boolean(item.facebookPage);
  if (platform === 'tiktok') return Boolean(item.tiktokPage);
  if (platform === 'instagram') return Boolean(item.instagramPage);
  if (platform === 'youtube') return Boolean(item.youtubePage);
  return true;
}

export function CreatorProfileManager({ initialItems }: { initialItems: CreatorDisplayProfile[] }) {
  const [items, setItems] = useState(initialItems);
  const [form, setForm] = useState<CreatorForm>(initialState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [queryHydrated, setQueryHydrated] = useState(false);

  const positions = useMemo(() => {
    return Array.from(new Set(items.map((item) => item.position || item.roleLabel).filter(Boolean))).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const filtered = items.filter((item) => {
      const matchesSearch = !query || [
        item.name,
        item.position,
        item.roleLabel,
        item.jobDescription,
        item.shortBio,
        item.biography,
      ].filter(Boolean).join(' ').toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && item.isActive) ||
        (statusFilter === 'inactive' && !item.isActive);

      const matchesPosition = positionFilter === 'all' || (item.position || item.roleLabel) === positionFilter;
      const matchesPlatform = platformFilter === 'all' || hasPlatform(item, platformFilter);

      return matchesSearch && matchesStatus && matchesPosition && matchesPlatform;
    });

    return [...filtered].sort((left, right) => {
      if (sortBy === 'name') return left.name.localeCompare(right.name);
      if (sortBy === 'followers') return totalFollowers(right) - totalFollowers(left);
      if (sortBy === 'updated') return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
      return left.sortOrder - right.sortOrder;
    });
  }, [items, platformFilter, positionFilter, search, sortBy, statusFilter]);

  useEffect(() => {
    if (queryHydrated) return;

    const editId = new URLSearchParams(window.location.search).get('edit');
    const item = editId ? items.find((currentItem) => currentItem.id === editId) : null;
    if (!item) {
      setQueryHydrated(true);
      return;
    }

    setEditingId(item.id);
    setForm(toForm(item));
    setQueryHydrated(true);
  }, [items, queryHydrated]);

  function resetForm() {
    setForm(initialState);
    setEditingId(null);
  }

  function hydrateForm(item: CreatorDisplayProfile) {
    setEditingId(item.id);
    setForm(toForm(item));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateField<K extends keyof CreatorForm>(key: K, value: CreatorForm[K]) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === 'name' && !editingId && !current.slug.trim()) {
        next.slug = slugifyCreatorName(String(value));
      }
      return next;
    });
  }

  async function saveCreator(payload: CreatorForm, id?: string) {
    const response = await fetch(id ? `/api/admin/creators/${id}` : '/api/admin/creators', {
      method: id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.error || 'Unable to save creator profile.');
    }

    return data.item as CreatorDisplayProfile;
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setError(null);
    setLoading(true);

    try {
      const item = await saveCreator(form, editingId || undefined);
      if (editingId) {
        setItems((current) => current.map((currentItem) => (currentItem.id === editingId ? item : currentItem)));
        setNotice('Creator profile updated successfully.');
      } else {
        setItems((current) => [item, ...current]);
        setNotice('Creator profile created successfully.');
      }
      resetForm();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save creator profile.');
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(item: CreatorDisplayProfile) {
    setNotice(null);
    setError(null);
    setLoading(true);
    try {
      const updated = await saveCreator({ ...toForm(item), isActive: !item.isActive }, item.id);
      setItems((current) => current.map((currentItem) => (currentItem.id === item.id ? updated : currentItem)));
      setNotice(`${item.name} is now ${updated.isActive ? 'active' : 'inactive'}.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to update creator status.');
    } finally {
      setLoading(false);
    }
  }

  async function removeItem(id: string, name: string) {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) return;

    setNotice(null);
    setError(null);
    setLoading(true);

    const response = await fetch(`/api/admin/creators/${id}`, { method: 'DELETE' });
    const data = await response.json().catch(() => null);
    setLoading(false);

    if (!response.ok) {
      setError(data?.error || 'Unable to delete creator profile.');
      return;
    }

    setItems((current) => current.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
    setNotice('Creator profile deleted.');
  }

  async function copyProfileLink(slug: string) {
    setNotice(null);
    setError(null);

    try {
      await navigator.clipboard.writeText(`${window.location.origin}/creators/${slug}`);
      setNotice('Creator profile link copied.');
    } catch {
      setError('Unable to copy profile link from this browser.');
    }
  }

  return (
    <div className="creator-admin-module">
      <section className="card creator-admin-form-card">
        <div className="section-kicker">Creators Management Module</div>
        <h2 style={{ marginTop: 0 }}>{editingId ? 'Update Creator Profile' : 'Create Creator User and Profile'}</h2>
        <p className="helper">
          Manage creator identity, basketball details, social links, public profile content, and optional creator login access from one admin workflow.
        </p>

        {notice ? <div className="notice success" style={{ marginTop: 18 }}>{notice}</div> : null}
        {error ? <div className="notice error" style={{ marginTop: 18 }}>{error}</div> : null}

        <form className="form-grid creator-admin-form" style={{ marginTop: 18 }} onSubmit={onSubmit}>
          <div className="creator-form-section">
            <div className="section-kicker">Core Profile</div>
            <input className="input" placeholder="Full Name" value={form.name} onChange={(event) => updateField('name', event.target.value)} required />
            <input className="input" placeholder="Slug (auto-generated when blank)" value={form.slug} onChange={(event) => updateField('slug', event.target.value)} />
            <input className="input" placeholder="Contact Number" value={form.contactNumber} onChange={(event) => updateField('contactNumber', event.target.value)} />
            <input className="input" placeholder="Address" value={form.address} onChange={(event) => updateField('address', event.target.value)} />
            <input className="input" type="date" value={form.dateOfBirth} onChange={(event) => updateField('dateOfBirth', event.target.value)} />
            <textarea className="textarea" placeholder="Job Description" value={form.jobDescription} onChange={(event) => updateField('jobDescription', event.target.value)} required />
            <input className="input" placeholder="Position" value={form.position} onChange={(event) => updateField('position', event.target.value)} />
            <input className="input" placeholder="Height" value={form.height} onChange={(event) => updateField('height', event.target.value)} />
            <input className="input" placeholder="Role Label" value={form.roleLabel} onChange={(event) => updateField('roleLabel', event.target.value)} />
          </div>

          <div className="creator-form-section">
            <div className="section-kicker">Creator Account</div>
            <input className="input" type="email" placeholder="Creator login email (optional)" value={form.accountEmail} onChange={(event) => updateField('accountEmail', event.target.value)} />
            <input
              className="input"
              type="password"
              placeholder={editingId ? 'New creator password (leave blank to keep current)' : 'Creator password (required when creating user)'}
              value={form.accountPassword}
              onChange={(event) => updateField('accountPassword', event.target.value)}
            />
            <p className="helper">If an email is provided, the API creates or links a dedicated CREATOR role user for this profile.</p>
          </div>

          <div className="creator-form-section">
            <div className="section-kicker">Social Links</div>
            <input className="input" placeholder="Facebook Page URL" value={form.facebookPage} onChange={(event) => updateField('facebookPage', event.target.value)} />
            <input className="input" placeholder="Facebook Followers" value={form.facebookFollowers} onChange={(event) => updateField('facebookFollowers', event.target.value)} />
            <input className="input" placeholder="TikTok Page URL" value={form.tiktokPage} onChange={(event) => updateField('tiktokPage', event.target.value)} />
            <input className="input" placeholder="TikTok Followers" value={form.tiktokFollowers} onChange={(event) => updateField('tiktokFollowers', event.target.value)} />
            <input className="input" placeholder="Instagram Page URL" value={form.instagramPage} onChange={(event) => updateField('instagramPage', event.target.value)} />
            <input className="input" placeholder="Instagram Followers" value={form.instagramFollowers} onChange={(event) => updateField('instagramFollowers', event.target.value)} />
            <input className="input" placeholder="YouTube Page URL" value={form.youtubePage} onChange={(event) => updateField('youtubePage', event.target.value)} />
            <input className="input" placeholder="YouTube Followers / Subscribers" value={form.youtubeFollowers} onChange={(event) => updateField('youtubeFollowers', event.target.value)} />
            <input className="input" placeholder="Trending Video Link" value={form.trendingVideoUrl} onChange={(event) => updateField('trendingVideoUrl', event.target.value)} />
          </div>

          <div className="creator-form-section">
            <div className="section-kicker">Dashboard Story</div>
            <ImageUploadField
              label="Profile Photo"
              value={form.imageUrl}
              scope="creator"
              helper="Upload a creator headshot, poster frame, or branded portrait."
              onChange={(value) => updateField('imageUrl', value)}
            />
            <textarea className="textarea" placeholder="Short Bio" value={form.shortBio} onChange={(event) => updateField('shortBio', event.target.value)} />
            <textarea className="textarea" placeholder="Biography" value={form.biography} onChange={(event) => updateField('biography', event.target.value)} />
            <textarea className="textarea" placeholder="Creator Journey / Basketball Background" value={form.journeyStory} onChange={(event) => updateField('journeyStory', event.target.value)} />
            <textarea className="textarea" placeholder="Platform Focus" value={form.platformFocus} onChange={(event) => updateField('platformFocus', event.target.value)} />
            <textarea className="textarea" placeholder="Audience" value={form.audience} onChange={(event) => updateField('audience', event.target.value)} />
          </div>

          <div className="creator-form-section">
            <div className="section-kicker">Stats and Status</div>
            <input className="input" type="number" step="0.1" placeholder="Points per game" value={form.pointsPerGame} onChange={(event) => updateField('pointsPerGame', event.target.value === '' ? '' : Number(event.target.value))} />
            <input className="input" type="number" step="0.1" placeholder="Assists per game" value={form.assistsPerGame} onChange={(event) => updateField('assistsPerGame', event.target.value === '' ? '' : Number(event.target.value))} />
            <input className="input" type="number" step="0.1" placeholder="Rebounds per game" value={form.reboundsPerGame} onChange={(event) => updateField('reboundsPerGame', event.target.value === '' ? '' : Number(event.target.value))} />
            <input className="input" type="number" placeholder="Sort order" value={form.sortOrder} onChange={(event) => updateField('sortOrder', Number(event.target.value))} />
            <label className="helper" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input type="checkbox" checked={form.isActive} onChange={(event) => updateField('isActive', event.target.checked)} />
              Creator is active
            </label>
          </div>

          <div className="btn-row">
            <button className="btn" type="submit" disabled={loading}>{loading ? 'Saving...' : editingId ? 'Update Creator' : 'Create Creator'}</button>
            {editingId ? <button className="btn btn-secondary" type="button" onClick={resetForm}>Cancel Edit</button> : null}
          </div>
        </form>
      </section>

      <section className="card">
        <div className="section-kicker">Search, Filter, Sort</div>
        <h2 style={{ marginTop: 0 }}>Creator directory controls</h2>
        <div className="creator-filter-grid">
          <input className="input" placeholder="Search by name, position, role, or bio" value={search} onChange={(event) => setSearch(event.target.value)} />
          <select className="select" value={positionFilter} onChange={(event) => setPositionFilter(event.target.value)}>
            <option value="all">All positions</option>
            {positions.map((position) => <option key={position} value={position}>{position}</option>)}
          </select>
          <select className="select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select className="select" value={platformFilter} onChange={(event) => setPlatformFilter(event.target.value)}>
            {platformFilters.map((filter) => <option key={filter.value} value={filter.value}>{filter.label}</option>)}
          </select>
          <select className="select" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="recent">Recently updated</option>
            <option value="name">Name</option>
            <option value="followers">Followers</option>
            <option value="sortOrder">Sort order</option>
          </select>
        </div>
      </section>

      <section className="card">
        <div className="section-kicker">Current Creator Roster</div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Creator</th>
                <th>Role</th>
                <th>Socials</th>
                <th>Readiness</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const stats = getCreatorStats(item);
                const linkedSocials = getLinkedCreatorSocials(item);

                return (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.name}</strong>
                      <div className="helper">/{item.slug}</div>
                      <div className="helper">{item.contactNumber || 'Not yet provided'}</div>
                      <div className={`status-chip ${item.isActive ? 'tone-success' : 'tone-danger'}`}>{item.isActive ? 'Active' : 'Inactive'}</div>
                    </td>
                    <td>
                      {item.position || item.roleLabel || 'Not yet provided'}
                      <div className="helper">{item.height || 'Not yet provided'}</div>
                      <div className="helper">{item.user?.email || 'No creator user linked'}</div>
                    </td>
                    <td>
                      <div className="creator-table-socials">
                        {linkedSocials.map((social) => (
                          <a key={social.key} href={social.url} target="_blank" rel="noopener noreferrer">{social.label}</a>
                        ))}
                        {!linkedSocials.length ? <span className="helper">No link available</span> : null}
                      </div>
                      <div className="helper">{stats.totalFollowersLabel}</div>
                    </td>
                    <td>
                      <strong>{stats.completeness}%</strong>
                      <div className="helper">Profile completeness</div>
                    </td>
                    <td>{formatCreatorShortDate(item.updatedAt)}</td>
                    <td>
                      <div className="btn-row">
                        <Link className="button-link btn-secondary" href={`/admin/creators/${item.id}`}>View</Link>
                        <button className="btn btn-secondary" type="button" onClick={() => hydrateForm(item)}>Edit</button>
                        <button className="btn btn-secondary" type="button" onClick={() => toggleStatus(item)} disabled={loading}>{item.isActive ? 'Deactivate' : 'Activate'}</button>
                        <button className="btn btn-secondary" type="button" onClick={() => copyProfileLink(item.slug)}>Copy Link</button>
                        <button className="btn btn-secondary" type="button" onClick={() => removeItem(item.id, item.name)} disabled={loading}>Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!filteredItems.length ? (
                <tr>
                  <td colSpan={6}>
                    <div className="empty-state">No creators match the current search and filters.</div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
