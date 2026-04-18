<<<<<<< HEAD
import { AdminShell } from '@/components/admin-shell';
import { SettingsManager } from '@/components/forms/settings-manager';
import { getPublicSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const settings = await getPublicSettings();

  return (
    <main>
      <AdminShell
        title="Settings and Deployment Notes"
        description="Update business contact details, admin branding, and report footer text from one system-admin settings module."
        currentPath="/admin/settings"
      >
        <SettingsManager initialSettings={settings} />
      </AdminShell>
    </main>
=======
"use client";

import { useEffect, useState } from "react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const keys = ["companyBranding", "adminContactData", "publicSiteDefaults", "contactInformation"];

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((json) => {
        setSettings(json.settings || {});
        setLoading(false);
      });
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ settings })
    });

    if (res.ok) setMessage("Settings saved.");
  }

  if (loading) return <div className="card">Loading settings...</div>;

  return (
    <form className="card crud-form" onSubmit={save}>
      <div className="card-title">Settings</div>
      {keys.map((key) => (
        <div key={key}>
          <label>{key}</label>
          <textarea
            rows={5}
            value={settings[key] || ""}
            onChange={(e) => setSettings((prev) => ({ ...prev, [key]: e.target.value }))}
          />
        </div>
      ))}
      <button className="button" type="submit">Save Settings</button>
      {message ? <div className="success-text">{message}</div> : null}
    </form>
>>>>>>> parent of d975526 (commit)
  );
}
