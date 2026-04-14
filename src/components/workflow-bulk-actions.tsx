"use client";

type WorkflowBulkActionsProps = {
  selectedCount: number;
  totalCount: number;
  statusOptions?: string[];
  onSelectAll: () => void;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onBulkStatusChange?: (status: string) => void;
};

export function WorkflowBulkActions({
  selectedCount,
  totalCount,
  statusOptions = [],
  onSelectAll,
  onClearSelection,
  onBulkDelete,
  onBulkStatusChange,
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

          {statusOptions.length && onBulkStatusChange ? (
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) {
                  onBulkStatusChange(e.target.value);
                  e.currentTarget.value = "";
                }
              }}
              style={{ minWidth: 170 }}
            >
              <option value="">Set status...</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          ) : null}

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
