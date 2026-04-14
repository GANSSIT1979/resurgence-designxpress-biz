"use client";

import { useState } from "react";
import type { ServerSavedViewRecord, ServerSavedViewState } from "@/hooks/use-server-saved-views";

type SavedViewsBarProps = {
  views: ServerSavedViewRecord[];
  loading?: boolean;
  onApply: (state: ServerSavedViewState) => void;
  onSave: (name: string) => Promise<boolean | undefined> | boolean | undefined;
  onDelete: (id: string) => Promise<boolean | undefined> | boolean | undefined;
  onReplace: (id: string, name?: string) => Promise<boolean | undefined> | boolean | undefined;
};

export function SavedViewsBar({
  views,
  loading = false,
  onApply,
  onSave,
  onDelete,
  onReplace,
}: SavedViewsBarProps) {
  const [draftName, setDraftName] = useState("");

  return (
    <section className="dashboard-surface" style={{ padding: 18 }}>
      <div className="dashboard-toolbar" style={{ marginBottom: 12 }}>
        <div>
          <div className="card-title" style={{ marginBottom: 4 }}>Saved Views</div>
          <div className="muted">Save and reuse filters for repeated operational workflows.</div>
        </div>
        <div className="inline-actions">
          <input
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            placeholder="Save current view as..."
            style={{ minWidth: 220 }}
          />
          <button
            type="button"
            className="button button-small"
            disabled={loading}
            onClick={async () => {
              const ok = await onSave(draftName);
              if (ok) setDraftName("");
            }}
          >
            {loading ? "Saving..." : "Save View"}
          </button>
        </div>
      </div>

      {views.length ? (
        <div className="saved-views-grid">
          {views.map((view) => (
            <div key={view.id} className="saved-view-chip">
              <button
                type="button"
                className="button button-secondary button-small"
                onClick={() =>
                  onApply({
                    search: view.search || "",
                    status: view.status || "",
                    filtersJson: view.filtersJson,
                    sortJson: view.sortJson,
                  })
                }
              >
                {view.name}
              </button>
              <button
                type="button"
                className="button button-secondary button-small"
                onClick={() => onReplace(view.id, view.name)}
                title="Update this view with current filters"
              >
                Update
              </button>
              <button
                type="button"
                className="button button-small"
                onClick={() => onDelete(view.id)}
                title="Delete saved view"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">No saved views yet.</div>
      )}
    </section>
  );
}
