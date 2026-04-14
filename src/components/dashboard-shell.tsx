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
          <div className="sidebar-brand">RESURGENCE</div>
          <div className="sidebar-subtitle">
            {subtitle || "Role-based dashboard"}
          </div>

          <nav className="sidebar-nav" aria-label={`${title} navigation`}>
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="dashboard-main">
          <div className="dashboard-page-title">{title}</div>
          {children}
        </main>
      </div>
    </div>
  );
}
