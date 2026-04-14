"use client";

import { useRef, useState } from "react";
import { FormFieldShell } from "./form-field-shell";

type ImageUploadFieldProps = {
  label?: string;
  value?: string;
  onChange: (value: string) => void;
  hint?: string;
  required?: boolean;
  name?: string;
};

async function readJsonSafe(res: Response) {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function ImageUploadField({
  label = "Image",
  value = "",
  onChange,
  hint = "Upload a JPG, PNG, or WEBP image for logos, creators, gallery items, or sponsor assets.",
  required = false,
  name = "image",
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function upload(file: File) {
    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await readJsonSafe(res);

      if (!res.ok) {
        setError(json?.error || "Unable to upload image.");
        return;
      }

      const imageUrl = json?.url || json?.image || "";
      if (!imageUrl) {
        setError("Upload completed, but no file URL was returned.");
        return;
      }

      onChange(imageUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload image.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <FormFieldShell label={label} hint={hint} error={error} required={required}>
      <div className="upload-stack">
        <div
          className="upload-dropzone"
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
        >
          {value ? (
            <img src={value} alt={label} className="upload-preview-image" />
          ) : (
            <div className="upload-placeholder">
              <strong>{loading ? "Uploading..." : "Click to upload image"}</strong>
              <span className="muted">Drag-and-drop styling ready. Current mode uses click upload.</span>
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) upload(file);
          }}
        />

        <div className="form-grid form-grid-single">
          <div className="field-shell">
            <div className="field-label-row">
              <label htmlFor={name}>Image URL</label>
            </div>
            <div className="field-control">
              <input
                id={name}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="/uploads/example.jpg"
              />
            </div>
          </div>
        </div>
      </div>
    </FormFieldShell>
  );
}
