import Link from "next/link";
import { getCurrentUser, getDashboardPath } from "../lib/auth";

export async function SiteHeader() {
  const user = await getCurrentUser();

  const primaryLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/sponsors", label: "Sponsors" },
    { href: "/sponsor/apply", label: "Sponsor Apply" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Go to homepage">
          <img
            src="/uploads/resurgence-logo.jpg"
            alt="RESURGENCE"
            className="brand-logo"
          />
          <div>
            <div className="brand-title">RESURGENCE</div>
            <div className="brand-subtitle">Powered by DesignXpress</div>
          </div>
        </Link>

        <nav className="nav" aria-label="Primary navigation">
          {primaryLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="inline-actions" aria-label="Quick actions">
          <Link href="/support" className="button button-secondary button-small">
            Support
          </Link>

          {user ? (
            <>
              <Link
                href={getDashboardPath(user.role)}
                className="button button-secondary button-small"
              >
                Dashboard
              </Link>

              <form action="/api/auth/logout" method="POST">
                <button type="submit" className="button button-small">
                  Logout
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className="button button-small">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}