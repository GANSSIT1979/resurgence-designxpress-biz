"use client";

import { useState } from "react";

type WorkflowRowActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
  rowLabel?: string;
  rowData?: Record<string, unknown>;
};

export function WorkflowRowActions({
  onEdit,
  onDelete,
  rowLabel = "Row",
  rowData,
}: WorkflowRowActionsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="workflow-row-actions">
      <button
        type="button"
        className="button button-secondary button-small"
        onClick={() => setOpen((current) => !current)}
      >
        Actions
      </button>

      {open ? (
        <div className="workflow-row-actions-menu">
          <button
            type="button"
            className="workflow-row-action-item"
            onClick={() => {
              onEdit();
              setOpen(false);
            }}
          >
            Edit {rowLabel}
          </button>

          <button
            type="button"
            className="workflow-row-action-item"
            onClick={() => {
              if (rowData) {
                navigator.clipboard?.writeText(JSON.stringify(rowData, null, 2));
              }
              setOpen(false);
            }}
          >
            Copy JSON
          </button>

          <button
            type="button"
            className="workflow-row-action-item workflow-row-action-danger"
            onClick={() => {
              onDelete();
              setOpen(false);
            }}
          >
            Delete {rowLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}
