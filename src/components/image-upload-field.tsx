'use client';

import { useState } from 'react';

type UploadScope = 'sponsor' | 'creator' | 'brand-profile';

export function ImageUploadField({
  label,
  value,
  scope,
  helper,
  onChange,
}: {
  label: string;
  value: string;
  scope: UploadScope;
  helper?: string;
  onChange: (value: string) => void;
}) {
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function onFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setNotice(null);
    setError(null);

    const payload = new FormData();
    payload.append('file', file);
    payload.append('scope', scope);

    const response = await fetch('/api/uploads/image', {
      method: 'POST',
      body: payload,
    });

    const data = await response.json();
    setUploading(false);

    if (!response.ok) {
      setError(data.error || 'Unable to upload image.');
      return;
    }

    onChange(data.url);
    setNotice('Image uploaded successfully.');
    event.target.value = '';
  }

  return (
    <div className="upload-field">
      <label className="helper" style={{ display: 'block', marginBottom: 8 }}>{label}</label>
      <input className="input" value={value} onChange={(event) => onChange(event.target.value)} placeholder="Paste an asset URL or upload an image" />
      <div className="btn-row" style={{ marginTop: 10 }}>
        <label className="btn btn-secondary" style={{ cursor: uploading ? 'wait' : 'pointer' }}>
          {uploading ? 'Uploading...' : 'Upload Image'}
          <input type="file" accept="image/*" onChange={onFileSelected} disabled={uploading} style={{ display: 'none' }} />
        </label>
      </div>
      {helper ? <div className="helper" style={{ marginTop: 8 }}>{helper}</div> : null}
      {notice ? <div className="notice success" style={{ marginTop: 12 }}>{notice}</div> : null}
      {error ? <div className="notice error" style={{ marginTop: 12 }}>{error}</div> : null}
      {value ? (
        <div className="upload-preview">
          <img src={value} alt={label} />
          <div className="helper">{value}</div>
        </div>
      ) : null}
    </div>
  );
}

