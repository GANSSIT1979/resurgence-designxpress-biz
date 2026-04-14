import type { ReactNode } from "react";

type FormFieldShellProps = {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
};

export function FormFieldShell({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
}: FormFieldShellProps) {
  return (
    <div className="field-shell">
      <div className="field-label-row">
        <label htmlFor={htmlFor}>
          {label}
          {required ? <span className="field-required"> *</span> : null}
        </label>
      </div>

      {hint ? <div className="field-hint">{hint}</div> : null}
      <div className="field-control">{children}</div>
      {error ? <div className="field-error">{error}</div> : null}
    </div>
  );
}
