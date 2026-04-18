"use client";

import { useRef, useState } from "react";

export function ModuleActionToolbar({
  exportHref,
  importHref,
  onImported,
}: {
  exportHref: string;
  importHref: string;
  onImported?: () => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState("");
  const [error, setError] = useState("");

  async function uploadFile(file: File) {
    setUploading(true);
    setDone("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(importHref, {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      const json = text ? JSON.parse(text) : {};

      if (!res.ok) {
        throw new Error(json?.error || "Unable to import file.");
      }

      setDone(`Imported ${json?.imported || 0} record(s).`);
      onImported?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to import file.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <section className="dashboard-surface" style={{ padding: 18 }}>
      <div className="dashboard-toolbar">
        <div>
          <div className="card-title" style={{ marginBottom: 4 }}>Module Actions</div>
          <div className="muted">View, download, upload, print, save, and monitor revenue-related records.</div>
        </div>

        <div className="inline-actions">
          <a href={exportHref} className="button button-secondary button-small">
            Download CSV
          </a>

          <button
            type="button"
            className="button button-secondary button-small"
            onClick={() => window.print()}
          >
            Print
          </button>

          <button
            type="button"
            className="button button-small"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? "Uploading..." : "Upload CSV"}
          </button>

          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            style={{ display: "none" }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFile(file);
            }}
          />
        </div>
      </div>

      {done ? <div className="success-text" style={{ marginTop: 12 }}>{done}</div> : null}
      {error ? <div className="field-error" style={{ marginTop: 12 }}>{error}</div> : null}
    </section>
  );
}
