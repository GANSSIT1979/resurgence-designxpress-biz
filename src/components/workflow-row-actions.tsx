"use client";

import { useState } from "react";

type WorkflowRowActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate?: () => void | Promise<void>;
  onStatusChange?: (status: string) => void | Promise<void>;
  rowLabel?: string;
  rowData?: Record<string, unknown>;
  statusOptions?: string[];
};

export function WorkflowRowActions({
  onEdit,
  onDelete,
  onDuplicate,
  onStatusChange,
  rowLabel = "Row",
  rowData,
  statusOptions = [],
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

          {onDuplicate ? (
            <button
              type="button"
              className="workflow-row-action-item"
              onClick={async () => {
                await onDuplicate();
                setOpen(false);
              }}
            >
              Duplicate {rowLabel}
            </button>
          ) : null}

          {statusOptions.length && onStatusChange ? (
            <div className="workflow-row-action-group">
              <div className="workflow-row-action-group-title">Quick Status</div>
              {statusOptions.map((status) => (
                <button
                  key={status}
                  type="button"
                  className="workflow-row-action-item"
                  onClick={async () => {
                    await onStatusChange(status);
                    setOpen(false);
                  }}
                >
                  Set {status}
                </button>
              ))}
            </div>
          ) : null}

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
