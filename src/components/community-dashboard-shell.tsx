import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getLoginRedirect } from '@/lib/auth';
import { getCurrentSessionUser } from '@/lib/session-server';
import { AppRole, roleMeta } from '@/lib/resurgence';

export async function CommunityDashboardShell({
  role,
  eyebrow,
  title,
  description,
  cards,
}: {
  role: AppRole;
  eyebrow: string;
  title: string;
  description: string;
  cards: Array<{ title: string; body: string; href?: string; cta?: string }>;
}) {
  const context = await getCurrentSessionUser();

  if (!context) redirect('/login');
  if (context.user.role !== role && context.user.role !== 'SYSTEM_ADMIN') {
    redirect(getLoginRedirect(context.user.role as AppRole));
  }

  const meta = roleMeta[role];

  return (
    <main className="section">
      <div className="container">
        <section className="card merch-hero-card">
          <div>
            <div className="section-kicker">{eyebrow}</div>
            <h1 className="section-title">{title}</h1>
            <p className="section-copy">{description}</p>
            <div className="btn-row" style={{ marginTop: 20 }}>
              <Link className="button-link" href="/shop">Explore Official Merch</Link>
              <Link className="button-link btn-secondary" href="/contact">Contact Support</Link>
            </div>
          </div>
          <div className="merch-hero-panel">
            <div className="section-kicker">Signed in as</div>
            <h2>{context.user.displayName}</h2>
            <p className="helper">{context.user.email}</p>
            <div className="merch-stat-grid">
              <div><strong>{meta.label}</strong><span>Account type</span></div>
              <div><strong>Free</strong><span>Membership status</span></div>
              <div><strong>Active</strong><span>Access state</span></div>
              <div><strong>2026</strong><span>Community season</span></div>
            </div>
          </div>
        </section>

        <section className="card-grid grid-3">
          {cards.map((card) => (
            <article className="card" key={card.title}>
              <div className="section-kicker">{meta.label}</div>
              <h2>{card.title}</h2>
              <p className="helper">{card.body}</p>
              {card.href ? <Link className="button-link btn-secondary" href={card.href}>{card.cta || 'Open'}</Link> : null}
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
