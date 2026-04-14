import type { ReactNode } from "react";

type FormSectionProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  compact?: boolean;
};

export function FormSection({
  eyebrow,
  title,
  subtitle,
  children,
  compact = false,
}: FormSectionProps) {
  return (
    <section className={`form-section-card${compact ? " form-section-card-compact" : ""}`}>
      <div className="form-section-head">
        {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
        <h2 className="form-section-title">{title}</h2>
        {subtitle ? <p className="form-section-subtitle">{subtitle}</p> : null}
      </div>
      <div className="form-section-body">{children}</div>
    </section>
  );
}
