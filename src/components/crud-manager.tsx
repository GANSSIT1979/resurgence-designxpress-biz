"use client";

import { useEffect, useMemo, useState } from "react";
import { ImageUploadField } from "@/components/image-upload-field";

type Field = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "checkbox" | "image" | "json" | "date";
  required?: boolean;
};

export function CrudManager({
  title,
  endpoint,
  fields,
  defaultValues = {}
}: {
  title: string;
  endpoint: string;
  fields: Field[];
  defaultValues?: Record<string, any>;
}) {
  const emptyRecord = useMemo(
    () =>
      Object.fromEntries(
        fields.map((field) => [
          field.key,
          defaultValues[field.key] ??
            (field.type === "checkbox" ? false : field.type === "json" ? "[]" : "")
        ])
      ),
    [fields, defaultValues]
  );

  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState<Record<string, any>>(emptyRecord);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch(endpoint, { cache: "no-store" });
    const json = await res.json();
    setItems(json.items || []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [endpoint]);

  function setField(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function buildPayload() {
    const payload: Record<string, any> = { ...form };

    for (const field of fields) {
      const value = payload[field.key];

      if (field.type === "json" && typeof value === "string" && value.trim()) {
        try {
          payload[field.key] = JSON.parse(value);
        } catch {
          throw new Error(`${field.label} contains invalid JSON.`);
        }
      }

      if (field.type === "number" && value !== "") {
        payload[field.key] = Number(value);
      }

      if (field.type === "checkbox") {
        payload[field.key] = Boolean(value);
      }
    }

    return payload;
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    let payload: Record<string, any>;
    try {
      payload = buildPayload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid form data");
      setSaving(false);
      return;
    }

    const res = await fetch(editingId ? `${endpoint}/${editingId}` : endpoint, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const json = await res.json();

    if (!res.ok) {
      setError(json.error || "Save failed");
      setSaving(false);
      return;
    }

    setMessage(editingId ? "Record updated." : "Record created.");
    setForm(emptyRecord);
    setEditingId(null);
    setSaving(false);
    await load();
  }

  function startEdit(item: any) {
    setEditingId(item.id);
    const next = { ...emptyRecord };
    for (const field of fields) {
      const value = item[field.key];
      next[field.key] =
        field.type === "json"
          ? JSON.stringify(value ?? [], null, 2)
          : field.type === "date" && value
            ? String(value).slice(0, 10)
            : value ?? next[field.key];
    }
    setForm(next);
  }

  async function remove(id: string) {
    const res = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
    if (res.ok) {
      await load();
    }
  }

  return (
    <div className="crud-layout">
      <div className="card">
        <div className="card-title">{title}</div>
        <form onSubmit={save} className="crud-form">
          {fields.map((field) => (
            <div key={field.key}>
              {field.type === "image" ? (
                <ImageUploadField
                  value={form[field.key] || ""}
                  onChange={(value) => setField(field.key, value)}
                  label={field.label}
                />
              ) : (
                <>
                  <label>{field.label}</label>
                  {field.type === "textarea" || field.type === "json" ? (
                    <textarea
                      required={field.required}
                      value={form[field.key] || ""}
                      onChange={(e) => setField(field.key, e.target.value)}
                      rows={field.type === "json" ? 6 : 4}
                    />
                  ) : field.type === "checkbox" ? (
                    <input
                      type="checkbox"
                      checked={Boolean(form[field.key])}
                      onChange={(e) => setField(field.key, e.target.checked)}
                    />
                  ) : (
                    <input
                      type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
                      step={field.type === "number" ? "0.01" : undefined}
                      required={field.required}
                      value={form[field.key] || ""}
                      onChange={(e) => setField(field.key, e.target.value)}
                    />
                  )}
                </>
              )}
            </div>
          ))}

          <div className="inline-actions">
            <button className="button" disabled={saving} type="submit">
              {saving ? "Saving..." : editingId ? "Update" : "Create"}
            </button>
            {editingId ? (
              <button
                className="button button-secondary"
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyRecord);
                }}
              >
                Cancel
              </button>
            ) : null}
          </div>
          {message ? <div className="success-text">{message}</div> : null}
          {error ? <div className="error-text">{error}</div> : null}
        </form>
      </div>

      <div className="card">
        <div className="card-title">Records</div>
        {loading ? (
          <div className="muted">Loading...</div>
        ) : items.length ? (
          <div className="list-stack">
            {items.map((item) => (
              <div className="list-item" key={item.id}>
                <div>
                  <strong>{item.title || item.name || item.fullName || item.key || item.number || item.subject || item.sponsorName}</strong>
                  <div className="muted">
                    {item.description || item.email || item.priceRange || item.category || item.status || item.slug || item.customerName || ""}
                  </div>
                </div>
                <div className="inline-actions">
                  <button className="button button-small button-secondary" type="button" onClick={() => startEdit(item)}>
                    Edit
                  </button>
                  <button className="button button-small" type="button" onClick={() => remove(item.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">No records found.</div>
        )}
      </div>
    </div>
  );
}
