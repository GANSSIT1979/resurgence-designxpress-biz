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
  soft?: boolean;
};

function normalizeTone(input: string): StatusTone {
  const value = input.trim().toUpperCase();

  if (["ACTIVE", "APPROVED", "PAID", "COMPLETED", "SUCCESS", "ENABLED", "DELIVERED", "REVIEWED"].includes(value)) {
    return "success";
  }

  if (["PENDING", "DRAFT", "NEW", "UNDER_REVIEW", "OPEN", "PARTIALLY_PAID", "IN_PROGRESS", "OVERDUE"].includes(value)) {
    return "warning";
  }

  if (["FAILED", "REJECTED", "DECLINED", "INACTIVE", "VOID", "DISABLED", "CLOSED"].includes(value)) {
    return "danger";
  }

  if (["FEATURED", "PRIORITY", "PREMIUM"].includes(value)) {
    return "accent";
  }

  if (["INFO"].includes(value)) {
    return "info";
  }

  return "neutral";
}

export function StatusBadge({ label, tone, soft = true }: StatusBadgeProps) {
  const resolvedTone = tone || normalizeTone(label);

  return (
    <span className={`status-badge status-badge-${resolvedTone}${soft ? " status-badge-soft" : ""}`}>
      <span>{label}</span>
    </span>
  );
}
