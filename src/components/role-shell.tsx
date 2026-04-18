import Link from 'next/link';

type RoleNavItem = { href: string; label: string };

export function RoleShell({
  title,
  description,
  roleLabel,
  navItems,
  children,
  currentPath,
}: {
  title: string;
  description: string;
  roleLabel: string;
  navItems: RoleNavItem[];
  children: React.ReactNode;
  currentPath?: string;
}) {
  return (
    <>
      <div className="admin-topbar">
        <div className="admin-topbar-inner">
          <div className="admin-brand">
            <div className="admin-brand-mark">
              <img src="/assets/resurgence-logo.jpg" alt="RESURGENCE logo" />
            </div>
            <div>
              <div className="admin-brand-title">{roleLabel}</div>
              <div className="admin-brand-subtitle">RESURGENCE Powered by DesignXpress</div>
            </div>
          </div>

          <div className="admin-topbar-meta">
            <div className="section-kicker" style={{ marginBottom: 6 }}>Role Dashboard</div>
            <div className="helper" style={{ margin: 0 }}>2026 sponsorship platform workflow</div>
          </div>

          <div className="admin-topbar-actions">
            <Link className="button-link btn-secondary" href="/">View Site</Link>
            <form action="/api/auth/logout" method="post">
              <button className="btn btn-secondary" type="submit">Logout</button>
            </form>
          </div>
        </div>

        <h1 className="section-title" style={{ fontSize: '2.4rem', marginBottom: 8 }}>{title}</h1>
        <p className="section-copy" style={{ maxWidth: 760 }}>{description}</p>
      </div>

      <div className="admin-layout admin-shell">
        <aside className="admin-sidebar">
          <div className="section-kicker" style={{ marginBottom: 16 }}>{roleLabel}</div>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={currentPath === item.href ? 'active' : undefined}>
              {item.label}
            </Link>
          ))}
        </aside>
        <main>{children}</main>
      </div>
    </>
  );
}
