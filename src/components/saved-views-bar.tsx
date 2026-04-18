"use client";

import { useState } from "react";
import type { SavedViewRecord, SavedViewState } from "@/hooks/use-saved-views";

type SavedViewsBarProps = {
  views: SavedViewRecord[];
  onApply: (state: SavedViewState) => void;
  onSave: (name: string) => void;
  onDelete: (id: string) => void;
  onReplace: (id: string) => void;
};

export function SavedViewsBar({
  views,
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
            onClick={() => {
              onSave(draftName);
              setDraftName("");
            }}
          >
            Save View
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
                onClick={() => onApply(view.state)}
              >
                {view.name}
              </button>
              <button
                type="button"
                className="button button-secondary button-small"
                onClick={() => onReplace(view.id)}
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
