import type { ReactNode } from "react";

type StatusTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "accent";

type StatusBadgeProps = {
  label: string;
  tone?: StatusTone;
  icon?: ReactNode;
  soft?: boolean;
};

function normalizeTone(input: string): StatusTone {
  const value = input.trim().toUpperCase();

  if (["ACTIVE", "APPROVED", "PAID", "COMPLETED", "SUCCESS", "ENABLED"].includes(value)) {
    return "success";
  }

  if (["PENDING", "DRAFT", "REVIEW", "PROCESSING", "NEW"].includes(value)) {
    return "warning";
  }

  if (["FAILED", "REJECTED", "INACTIVE", "VOID", "OVERDUE", "DISABLED"].includes(value)) {
    return "danger";
  }

  if (["FEATURED", "PRIORITY", "PREMIUM"].includes(value)) {
    return "accent";
  }

  if (["INFO", "OPEN"].includes(value)) {
    return "info";
  }

  return "neutral";
}

export function StatusBadge({
  label,
  tone,
  icon,
  soft = true,
}: StatusBadgeProps) {
  const resolvedTone = tone || normalizeTone(label);

  return (
    <span
      className={`status-badge status-badge-${resolvedTone}${soft ? " status-badge-soft" : ""}`}
    >
      {icon ? <span className="status-badge-icon">{icon}</span> : null}
      <span>{label}</span>
    </span>
  );
}
