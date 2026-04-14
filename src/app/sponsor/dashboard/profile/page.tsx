"use client";

import { useEffect, useState } from "react";

type SponsorProfileForm = {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  notes: string;
};

const emptyForm: SponsorProfileForm = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  website: "",
  address: "",
  notes: "",
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

export default function SponsorProfilePage() {
  const [form, setForm] = useState<SponsorProfileForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch("/api/sponsor/profile", {
          cache: "no-store",
        });

        const json = await readJsonSafe(res);

        if (!res.ok) {
          if (!active) return;
          setError(json?.error || "Unable to load sponsor profile.");
          return;
        }

        if (!active) return;

        const item = json?.item;
        if (item) {
          setForm({
            companyName: item.companyName ?? "",
            contactName: item.contactName ?? "",
            email: item.email ?? "",
            phone: item.phone ?? "",
            website: item.website ?? "",
            address: item.address ?? "",
            notes: item.notes ?? "",
          });
        } else {
          setForm(emptyForm);
        }
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Unable to load sponsor profile.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setDone("");

    try {
      const res = await fetch("/api/sponsor/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const json = await readJsonSafe(res);

      if (!res.ok) {
        setError(json?.error || "Unable to save sponsor profile.");
        return;
      }

      setDone("Sponsor profile saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save sponsor profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="card">Loading sponsor profile...</div>;
  }

  return (
    <div className="card">
      <h1 style={{ marginTop: 0 }}>Sponsor Profile</h1>

      {error ? <div className="error-text">{error}</div> : null}
      {done ? <div className="success-text">{done}</div> : null}

      <form className="form-card" onSubmit={save}>
        <div>
          <label>Company Name</label>
          <input
            value={form.companyName}
            onChange={(e) => setForm((s) => ({ ...s, companyName: e.target.value }))}
          />
        </div>

        <div>
          <label>Contact Name</label>
          <input
            value={form.contactName}
            onChange={(e) => setForm((s) => ({ ...s, contactName: e.target.value }))}
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
          />
        </div>

        <div>
          <label>Phone</label>
          <input
            value={form.phone}
            onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
          />
        </div>

        <div>
          <label>Website</label>
          <input
            value={form.website}
            onChange={(e) => setForm((s) => ({ ...s, website: e.target.value }))}
          />
        </div>

        <div>
          <label>Address</label>
          <input
            value={form.address}
            onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
          />
        </div>

        <div>
          <label>Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((s) => ({ ...s, notes: e.target.value }))}
          />
        </div>

        <button className="button" type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </div>
  );
}