import Link from 'next/link';
import { AdminPrintButton } from '@/components/admin-print-button';
import { getPublicSettings } from '@/lib/settings';

const items = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/sponsor-submissions', label: 'Sponsor Submissions' },
  { href: '/admin/sponsor-packages', label: 'Sponsor Packages' },
  { href: '/admin/creators', label: 'Manage Creators' },
  { href: '/admin/gallery', label: 'Gallery' },
  { href: '/admin/sponsor-inventory', label: 'Sponsor Inventory' },
  { href: '/admin/sponsors', label: 'Sponsors' },
  { href: '/admin/partners', label: 'Partners' },
  { href: '/admin/inquiries', label: 'Inquiries' },
  { href: '/admin/content', label: 'Content CMS' },
  { href: '/admin/product-services', label: 'Products & Services' },
  { href: '/admin/products', label: 'Shop Products' },
  { href: '/admin/orders', label: 'Shop Orders' },
  { href: '/admin/users', label: 'Users & Roles' },
  { href: '/admin/reports', label: 'Reports' },
  { href: '/admin/settings', label: 'Settings' },
];

export async function AdminShell({
  title,
  description,
  children,
  currentPath,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  currentPath?: string;
}) {
  const settings = await getPublicSettings();

  return (
    <>
      <div className="admin-topbar">
        <div className="admin-topbar-inner">
          <div className="admin-brand">
            <div className="admin-brand-mark">
              <img src="/assets/resurgence-logo.jpg" alt="RESURGENCE logo" />
            </div>
            <div>
              <div className="admin-brand-title">{settings.adminTitle}</div>
              <div className="admin-brand-subtitle">{settings.adminSubtitle}</div>
            </div>
          </div>

          <div className="admin-topbar-meta">
            <div className="section-kicker" style={{ marginBottom: 6 }}>System Admin Dashboard</div>
            <div className="helper" style={{ margin: 0 }}>
              {settings.contactRole}: {settings.contactName} • {settings.contactEmail} • {settings.contactPhone}
            </div>
          </div>

          <div className="admin-topbar-actions">
            <Link className="button-link btn-secondary" href="/">View Site</Link>
            <AdminPrintButton label="Print" />
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
          <div className="section-kicker" style={{ marginBottom: 16 }}>Manage Platform</div>
          {items.map((item) => (
            <Link key={item.href} href={item.href} className={currentPath === item.href ? 'active' : undefined}>
              {item.label}
            </Link>
          ))}
          <div className="admin-sidebar-footer">
            <div className="helper"><strong>{settings.brandName}</strong></div>
            <div className="helper">{settings.companyName}</div>
            <div className="helper">{settings.siteUrl}</div>
            <div style={{ height: 10 }} />
            <div className="helper"><strong>Primary Contact</strong></div>
            <div className="helper">{settings.contactName}</div>
            <div className="helper">{settings.contactRole}</div>
            <div className="helper">{settings.contactEmail}</div>
            <div className="helper">{settings.contactPhone}</div>
            <div className="helper">{settings.contactAddress}</div>
            <div style={{ height: 10 }} />
            <div className="helper"><strong>Support Desk</strong></div>
            <div className="helper">{settings.supportEmail}</div>
            <div className="helper">{settings.supportPhone}</div>
            <div className="helper">{settings.businessHours}</div>
            <div style={{ height: 10 }} />
            <div className="helper">Sponsor application page:</div>
            <Link className="helper" href="/sponsor/apply" style={{ color: 'white' }}>/sponsor/apply</Link>
          </div>
        </aside>

        <main>{children}</main>
      </div>
    </>
  );
}
