import Link from 'next/link';
import { SiteHeaderAccountControls } from '@/components/site-header-account-controls';

const links = [
  { href: '/', label: 'Home' },
  { href: '/feed', label: 'Feed' },
  { href: '/creators', label: 'Creators' },
  { href: '/shop', label: 'Merch' },
  { href: '/sponsors', label: 'Sponsors' },
  { href: '/sponsor/apply', label: 'Sponsor Apply' },
  { href: '/support', label: 'AI Support' },
  { href: '/contact', label: 'Contact' },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="brand-lockup">
          <div className="brand-mark">
            <img src="/assets/resurgence-logo.jpg" alt="RESURGENCE logo" />
          </div>
          <div>
            <div className="brand-name">RESURGENCE</div>
            <div className="brand-subtitle">Powered by DesignXpress</div>
          </div>
        </Link>

        <div className="site-header-actions">
          <nav className="nav-links" aria-label="Primary navigation">
            {links.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="site-header-cta-row">
            <Link href="/shop" className="nav-highlight-link">Shop Drops</Link>
            <SiteHeaderAccountControls />
          </div>
        </div>
      </div>
    </header>
  );
}
