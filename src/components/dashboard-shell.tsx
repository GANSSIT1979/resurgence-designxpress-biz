import Link from "next/link";
import type { ReactNode } from "react";

type DashboardLink = {
  href: string;
  label: string;
};

type DashboardShellProps = {
  title: string;
  subtitle?: string;
  links: DashboardLink[];
  children: ReactNode;
};

export function DashboardShell({
  title,
  subtitle,
  links,
  children,
}: DashboardShellProps) {
  return (
    <div className="page-shell">
      <div className="container dashboard-shell">
        <aside className="dashboard-sidebar">
          <div className="dashboard-sidebar-card">
            <div className="sidebar-brand-row">
              <div className="sidebar-brand">RESURGENCE</div>
              <div className="sidebar-subtitle">{subtitle || "Role-based dashboard"}</div>
            </div>

            <nav className="sidebar-nav" aria-label={`${title} navigation`}>
              {links.map((link) => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </aside>

        <main className="dashboard-main">
          <section className="dashboard-hero-card">
            <div>
              <div className="eyebrow">Dashboard Workspace</div>
              <h1 className="dashboard-page-title">{title}</h1>
              {subtitle ? <p className="dashboard-page-subtitle">{subtitle}</p> : null}
            </div>

            <div className="dashboard-hero-actions">
              <Link href="/support" className="button button-secondary button-small">
                Support
              </Link>
              <Link href="/contact" className="button button-small">
                Contact Team
              </Link>
            </div>
          </section>

          <div className="dashboard-content-stack">{children}</div>
        </main>
      </div>
    </div>
  );
}
