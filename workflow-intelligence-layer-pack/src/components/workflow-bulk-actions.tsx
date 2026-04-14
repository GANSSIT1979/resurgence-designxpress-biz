"use client";

type WorkflowBulkActionsProps = {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkDelete: () => void;
};

export function WorkflowBulkActions({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
  onBulkDelete,
}: WorkflowBulkActionsProps) {
  return (
    <section className="dashboard-surface" style={{ padding: 18 }}>
      <div className="dashboard-toolbar">
        <div>
          <div className="card-title" style={{ marginBottom: 4 }}>Bulk Actions</div>
          <div className="muted">
            {selectedCount} selected out of {totalCount} visible records
          </div>
        </div>

        <div className="inline-actions">
          <button type="button" className="button button-secondary button-small" onClick={onSelectAll}>
            Select All Visible
          </button>
          <button type="button" className="button button-secondary button-small" onClick={onClearSelection}>
            Clear Selection
          </button>
          <button
            type="button"
            className="button button-small"
            disabled={!selectedCount}
            onClick={onBulkDelete}
          >
            Delete Selected
          </button>
        </div>
      </div>
    </section>
  );
}
