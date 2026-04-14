"use client";

import { useState } from "react";

export function ImageUploadField({
  value,
  onChange,
  label = "Image Path"
}: {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const json = await res.json();

    if (!res.ok) {
      setError(json.error || "Upload failed");
      setUploading(false);
      return;
    }

    onChange(json.path);
    setUploading(false);
  }

  return (
    <div>
      <label>{label}</label>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="/uploads/example.jpg" />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {uploading ? <div className="muted">Uploading...</div> : null}
      {error ? <div className="error-text">{error}</div> : null}
    </div>
  );
}
