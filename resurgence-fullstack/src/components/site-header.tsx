import Link from 'next/link';

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/shop', label: 'Shop' },
  { href: '/cart', label: 'Cart' },
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
        </nav>
      </div>
    </header>
  );
}
