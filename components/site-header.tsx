import Link from "next/link";
import { getCurrentUser, getDashboardPath } from "@/lib/auth";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand">
          <img src="/uploads/resurgence-logo.jpg" alt="RESURGENCE" className="brand-logo" />
          <div>
            <div className="brand-title">RESURGENCE</div>
            <div className="brand-subtitle">Powered by DesignXpress</div>
          </div>
        </Link>

        <nav className="nav">
          <Link href="/">Home</Link>
          <Link href="/about">About</Link>
          <Link href="/services">Services</Link>
          <Link href="/sponsors">Sponsors</Link>
          <Link href="/sponsor/apply">Sponsor Apply</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/support">Support</Link>
          {user ? (
            <Link href={getDashboardPath(user.role)} className="button button-small">
              Dashboard
            </Link>
          ) : (
            <Link href="/login" className="button button-small">
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
