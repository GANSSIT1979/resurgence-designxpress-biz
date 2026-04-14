import type { ReactNode } from "react";

type EmptyStatePanelProps = {
  title?: string;
  description?: string;
  actions?: ReactNode;
};

export function EmptyStatePanel({
  title = "No data available yet",
  description = "Records will appear here once data has been created, synced, or approved.",
  actions,
}: EmptyStatePanelProps) {
  return (
    <div className="semantic-empty-state">
      <div className="semantic-empty-state-icon">○</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {actions ? <div className="semantic-empty-state-actions">{actions}</div> : null}
    </div>
  );
}
