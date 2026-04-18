"use client";

import { useState } from "react";

type SettingsState = {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  adminTitle: string;
  adminSubtitle: string;
  reportFooter: string;
};

async function readJsonSafe(res: Response) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export function SettingsForm({
  initialSettings,
}: {
  initialSettings: SettingsState;
}) {
  const [settings, setSettings] = useState<SettingsState>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setDone("");
    setError("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      const json = await readJsonSafe(res);

      if (!res.ok) {
        throw new Error(
          typeof json?.error === "string" ? json.error : "Unable to save settings."
        );
      }

      setSettings(json?.settings || settings);
      setDone("Settings saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="form-section-card">
      <div className="form-section-head">
        <div className="eyebrow">Settings Workspace</div>
        <h2 className="form-section-title">Editable configuration</h2>
        <p className="form-section-subtitle">
          These values drive admin labels, public contact defaults, and report footer text.
        </p>
      </div>

      {error ? <div className="field-error">{error}</div> : null}
      {done ? <div className="success-text">{done}</div> : null}

      <form className="crud-form" onSubmit={onSubmit}>
        <div className="form-grid">
          <div className="field-shell">
            <div className="field-label-row">
              <label htmlFor="contactName">Contact Name</label>
            </div>
            <div className="field-control">
              <input
                id="contactName"
                value={settings.contactName}
                onChange={(e) =>
                  setSettings((current) => ({ ...current, contactName: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="field-shell">
            <div className="field-label-row">
              <label htmlFor="contactEmail">Contact Email</label>
            </div>
            <div className="field-control">
              <input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) =>
                  setSettings((current) => ({ ...current, contactEmail: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="field-shell">
            <div className="field-label-row">
              <label htmlFor="contactPhone">Contact Phone</label>
            </div>
            <div className="field-control">
              <input
                id="contactPhone"
                value={settings.contactPhone}
                onChange={(e) =>
                  setSettings((current) => ({ ...current, contactPhone: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="field-shell">
            <div className="field-label-row">
              <label htmlFor="contactAddress">Contact Address</label>
            </div>
            <div className="field-control">
              <input
                id="contactAddress"
                value={settings.contactAddress}
                onChange={(e) =>
                  setSettings((current) => ({ ...current, contactAddress: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="field-shell">
            <div className="field-label-row">
              <label htmlFor="adminTitle">Admin Title</label>
            </div>
            <div className="field-control">
              <input
                id="adminTitle"
                value={settings.adminTitle}
                onChange={(e) =>
                  setSettings((current) => ({ ...current, adminTitle: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="field-shell">
            <div className="field-label-row">
              <label htmlFor="adminSubtitle">Admin Subtitle</label>
            </div>
            <div className="field-control">
              <input
                id="adminSubtitle"
                value={settings.adminSubtitle}
                onChange={(e) =>
                  setSettings((current) => ({ ...current, adminSubtitle: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="field-shell" style={{ gridColumn: "1 / -1" }}>
            <div className="field-label-row">
              <label htmlFor="reportFooter">Report Footer</label>
            </div>
            <div className="field-control">
              <textarea
                id="reportFooter"
                rows={4}
                value={settings.reportFooter}
                onChange={(e) =>
                  setSettings((current) => ({ ...current, reportFooter: e.target.value }))
                }
              />
            </div>
          </div>
        </div>

        <div className="form-actions-bar form-actions-right">
          <button className="button" type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </section>
  );
}