import Link from "next/link";
import { ReactNode } from "react";

export function DashboardShell({
  title,
  links,
  children
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
  children: ReactNode;
}) {
  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">RESURGENCE</div>
        <div className="sidebar-subtitle">Powered by DesignXpress</div>
        <nav className="sidebar-nav">
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
  );
}
