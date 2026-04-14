import type { ReactNode } from "react";

type FormActionsProps = {
  children: ReactNode;
  align?: "left" | "right" | "between";
  sticky?: boolean;
};

export function FormActions({
  children,
  align = "right",
  sticky = false,
}: FormActionsProps) {
  const alignClass =
    align === "left" ? "form-actions-left" : align === "between" ? "form-actions-between" : "form-actions-right";

  return (
    <div className={`form-actions-bar ${alignClass}${sticky ? " form-actions-sticky" : ""}`}>
      {children}
    </div>
  );
}
