import type { ReactNode } from "react";
import { DashboardTabs } from "./dashboard-tabs";

type DashboardPageTab = {
  href: string;
  label: string;
  exact?: boolean;
  count?: number | string;
};

type DashboardPageOrchestratorProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  tabs?: DashboardPageTab[];
  actions?: ReactNode;
  metrics?: ReactNode;
  filters?: ReactNode;
  children: ReactNode;
};

export function DashboardPageOrchestrator({
  eyebrow = "Operations Overview",
  title,
  subtitle,
  tabs = [],
  actions,
  metrics,
  filters,
  children,
}: DashboardPageOrchestratorProps) {
  return (
    <div className="dashboard-content-stack">
      <section className="dashboard-surface dashboard-page-section">
        <div className="dashboard-toolbar">
          <div>
            <div className="eyebrow">{eyebrow}</div>
            <h2 className="dashboard-section-title">{title}</h2>
            {subtitle ? <p className="dashboard-section-subtitle">{subtitle}</p> : null}
          </div>
          {actions ? <div className="dashboard-filters-actions">{actions}</div> : null}
        </div>
      </section>

      {tabs.length ? <DashboardTabs tabs={tabs} /> : null}
      {filters}
      {metrics}
      {children}
    </div>
  );
}
