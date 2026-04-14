import Link from "next/link";
import { getCurrentUser, getDashboardPath } from "@/lib/auth";

export async function SiteHeader() {
  let user = null as Awaited<ReturnType<typeof getCurrentUser>> | null;

  try {
    user = await getCurrentUser();
  } catch (error) {
    console.error("SiteHeader auth fallback:", error);
    user = null;
  }

  const primaryLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/services", label: "Services" },
    { href: "/sponsors", label: "Sponsors" },
    { href: "/sponsor/apply", label: "Sponsor Apply" },
    { href: "/contact", label: "Contact" },
  ];

  const dashboardHref = user ? getDashboardPath(user.role) : "/login";
  const dashboardLabel = user ? "Dashboard" : "Login";

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
          <Link href={dashboardHref} className="button button-small">
            {dashboardLabel}
          </Link>
        </div>
      </div>
    </header>
  );
}
