import Link from 'next/link';
import { SiteHeaderAccountControls } from '@/components/site-header-account-controls';

const links = [
  { href: '/', label: 'Home' },
  { href: '/feed', label: 'Feed' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/partnerships', label: 'Partnerships' },
  { href: '/shop', label: 'Merch' },
  { href: '/cart', label: 'Cart' },
  { href: '/creators', label: 'Creators' },
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

        <nav className="nav-links" aria-label="Primary navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
          <SiteHeaderAccountControls />
        </nav>
      </div>
    </header>
  );
}
