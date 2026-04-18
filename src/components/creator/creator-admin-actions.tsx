'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { CreatorDisplayProfile } from '@/lib/creators';

function profileUrl(slug: string) {
  if (typeof window === 'undefined') return `/creators/${slug}`;
  return `${window.location.origin}/creators/${slug}`;
}

export function CreatorAdminActions({ creator }: { creator: CreatorDisplayProfile }) {
  const router = useRouter();
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function copyProfileLink() {
    setNotice('');
    setError('');
    const url = profileUrl(creator.slug);

    try {
      await navigator.clipboard.writeText(url);
      setNotice('Profile link copied.');
    } catch {
      setError('Unable to copy link from this browser.');
    }
  }

  async function toggleStatus() {
    setBusy(true);
    setNotice('');
    setError('');

    const response = await fetch(`/api/admin/creators/${creator.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...creator,
        dateOfBirth: creator.dateOfBirth || '',
        accountEmail: creator.user?.email || '',
        accountPassword: '',
        isActive: !creator.isActive,
      }),
    });

    const data = await response.json().catch(() => null);
    setBusy(false);

    if (!response.ok) {
      setError(data?.error || 'Unable to update creator status.');
      return;
    }

    setNotice(`Creator ${data.item.isActive ? 'activated' : 'deactivated'}.`);
    router.refresh();
  }

  async function deleteCreator() {
    if (!window.confirm(`Delete ${creator.name}? This cannot be undone.`)) return;

    setBusy(true);
    setNotice('');
    setError('');

    const response = await fetch(`/api/admin/creators/${creator.id}`, { method: 'DELETE' });
    const data = await response.json().catch(() => null);
    setBusy(false);

    if (!response.ok) {
      setError(data?.error || 'Unable to delete creator.');
      return;
    }

    router.replace('/admin/creators');
    router.refresh();
  }

  return (
    <section className="card">
      <div className="section-kicker">Admin Actions</div>
      <h2 style={{ marginTop: 0 }}>Manage this creator</h2>
      {notice ? <div className="notice success" style={{ marginBottom: 14 }}>{notice}</div> : null}
      {error ? <div className="notice error" style={{ marginBottom: 14 }}>{error}</div> : null}
      <div className="btn-row">
        <a className="button-link" href={`/admin/creators?edit=${creator.id}`}>Edit Profile</a>
        <button className="btn btn-secondary" type="button" onClick={toggleStatus} disabled={busy}>
          {creator.isActive ? 'Deactivate' : 'Activate'}
        </button>
        <button className="btn btn-secondary" type="button" onClick={copyProfileLink}>
          Copy Profile Link
        </button>
        <button className="btn btn-secondary" type="button" onClick={deleteCreator} disabled={busy}>
          Delete Creator
        </button>
      </div>
    </section>
  );
}
