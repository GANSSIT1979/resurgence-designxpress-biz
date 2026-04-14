import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="site-section-stack">
          <div>
            <h3>RESURGENCE</h3>
            <p className="muted">
              Sports-business partnerships, creator network campaigns, sponsorship
              execution, and operational visibility built for measurable growth.
            </p>
          </div>
          <div className="muted">
            © {year} RESURGENCE Powered by DesignXpress. All rights reserved.
          </div>
        </div>

        <div>
          <h4>Quick Links</h4>
          <ul className="plain-list">
            <li><Link href="/">Home</Link></li>
            <li><Link href="/sponsors">Sponsors</Link></li>
            <li><Link href="/sponsor/apply">Sponsor Apply</Link></li>
            <li><Link href="/contact">Contact</Link></li>
            <li><Link href="/support">Support</Link></li>
          </ul>
        </div>

        <div className="site-section-stack">
          <div>
            <h4>Platform Highlights</h4>
            <ul className="plain-list">
              <li>2.15M+ combined followers</li>
              <li>2 active platforms</li>
              <li>6 high-engagement creators</li>
            </ul>
          </div>

          <div>
            <h4>Contact Jake</h4>
            <p className="muted">
              Business development, sponsorship coordination, and partnership
              planning for RESURGENCE Powered by DesignXpress.
            </p>
          </div>

          <div className="inline-actions">
            <Link href="/contact" className="button button-small">
              Start Inquiry
            </Link>
            <Link href="/sponsor/apply" className="button button-secondary button-small">
              Apply as Sponsor
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
