"use client";

import { useEffect, useState } from "react";

export default function SponsorProfilePage() {
  const [form, setForm] = useState({
    headline: "",
    description: "",
    contactName: "",
    contactEmail: "",
    logo: ""
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/sponsor/profile")
      .then((res) => res.json())
      .then((json) => {
        if (json.item) {
          setForm({
            headline: json.item.headline || "",
            description: json.item.description || "",
            contactName: json.item.contactName || "",
            contactEmail: json.item.contactEmail || "",
            logo: json.item.logo || ""
          });
        }
      });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/sponsor/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(form)
    });

    if (res.ok) setMessage("Profile saved.");
  }

  return (
    <form className="card crud-form" onSubmit={save}>
      <div className="card-title">Sponsor Profile</div>
      <div>
        <label>Headline</label>
        <input value={form.headline} onChange={(e) => setForm((prev) => ({ ...prev, headline: e.target.value }))} />
      </div>
      <div>
        <label>Description</label>
        <textarea rows={5} value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
      </div>
      <div>
        <label>Contact Name</label>
        <input value={form.contactName} onChange={(e) => setForm((prev) => ({ ...prev, contactName: e.target.value }))} />
      </div>
      <div>
        <label>Contact Email</label>
        <input value={form.contactEmail} onChange={(e) => setForm((prev) => ({ ...prev, contactEmail: e.target.value }))} />
      </div>
      <div>
        <label>Logo Path</label>
        <input value={form.logo} onChange={(e) => setForm((prev) => ({ ...prev, logo: e.target.value }))} />
      </div>
      <button className="button" type="submit">Save Profile</button>
      {message ? <div className="success-text">{message}</div> : null}
    </form>
  );
}
