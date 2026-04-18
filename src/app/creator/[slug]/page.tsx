import Link from 'next/link';
import { getCreatorBySlug } from '@/lib/site';
import { EventMediaCarousel } from '@/components/event-media-carousel';
import { CreatorAnalyticsPanel } from '@/components/creator-analytics-panel';

export const dynamic = 'force-dynamic';

<<<<<<< HEAD
export default async function CreatorDashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const creator = await getCreatorBySlug(slug);
=======
function normalizeSocialLinks(value: string | null | undefined): SocialLink[] {
  const parsed = parseJsonSafely<unknown>(value, []);

  if (Array.isArray(parsed)) {
    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const record = item as Record<string, unknown>;
        return {
          label: typeof record.label === "string" ? record.label : "Profile",
          url: typeof record.url === "string" ? record.url : "",
        };
      })
      .filter((item): item is SocialLink => Boolean(item?.url));
  }

  if (parsed && typeof parsed === "object") {
    return Object.entries(parsed as Record<string, unknown>)
      .map(([key, value]) => ({
        label: key,
        url: typeof value === "string" ? value : "",
      }))
      .filter((item) => item.url);
  }

  return [];
}

function statValue(value: number | string | null | undefined, fallback = "—") {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "number") return Number.isFinite(value) ? value.toFixed(1) : fallback;
  if (typeof value === "string" && value.trim()) return value;
  return fallback;
}

export default async function CreatorProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const creator = await db.creatorProfile.findUnique({
    where: { slug },
  });
>>>>>>> parent of d975526 (commit)

  if (!creator) {
    return (
      <main className="section">
        <div className="container">
          <h1 className="section-title">Creator not found</h1>
          <p className="section-copy">The creator profile you requested is not available.</p>
          <Link href="/" className="button-link">Back to homepage</Link>
        </div>
      </main>
    );
  }

<<<<<<< HEAD
  const orderedEvents = [...creator.mediaEvents].sort((a, b) => {
    const dateA = a.eventDate ? new Date(a.eventDate).getTime() : 0;
    const dateB = b.eventDate ? new Date(b.eventDate).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <main>
      <section className="hero" style={{ padding: '4rem 0' }}>
        <div className="container hero-grid">
          <div>
            <span className="badge">Creator Dashboard</span>
            <h1 className="hero-title">{creator.name}</h1>
            <p className="hero-copy">{creator.biography || creator.platformFocus}</p>
            <div className="stat-grid" style={{ marginTop: 24 }}>
              <div className="stat-card"><strong>{creator.pointsPerGame ?? 0}</strong><div className="helper">Points Per Game</div></div>
              <div className="stat-card"><strong>{creator.assistsPerGame ?? 0}</strong><div className="helper">Assists Per Game</div></div>
              <div className="stat-card"><strong>{creator.reboundsPerGame ?? 0}</strong><div className="helper">Rebounds Per Game</div></div>
              <div className="stat-card"><strong>{orderedEvents.length}</strong><div className="helper">Media Events</div></div>
=======
  const socialLinks = normalizeSocialLinks((creator as Record<string, unknown>).socialLinks as string | null | undefined);
  const journeyStory =
    typeof (creator as Record<string, unknown>).journeyStory === "string"
      ? ((creator as Record<string, unknown>).journeyStory as string)
      : "";
  const biography =
    typeof creator.biography === "string" && creator.biography.trim()
      ? creator.biography
      : "Creator profile details will be updated soon.";
  const heroImage = creator.image || "/uploads/resurgence-logo.jpg";

  return (
    <div className="page-shell">
      <div className="container">
        <section
          className="card creator-profile-hero"
          style={{
            padding: 0,
            overflow: "hidden",
            marginBottom: 24,
            background:
              "linear-gradient(135deg, rgba(255, 211, 77, 0.10), rgba(57, 181, 255, 0.08)), linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.03))",
          }}
        >
          <div
            className="creator-profile-hero"
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(320px, 0.95fr) 1.15fr",
              gap: 0,
            }}
          >
            <div
              style={{
                padding: 16,
                minHeight: 420,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
              }}
            >
              <img
                src={heroImage}
                alt={creator.fullName}
                style={{
                  width: "100%",
                  height: "100%",
                  minHeight: 388,
                  objectFit: "cover",
                  borderRadius: 24,
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              />
            </div>

            <div style={{ padding: 28 }}>
              <div className="eyebrow">Creator Profile</div>
              <h1
                style={{
                  marginTop: 0,
                  marginBottom: 14,
                  fontSize: "clamp(2rem, 4vw, 3.2rem)",
                  lineHeight: 1.02,
                }}
              >
                {creator.fullName}
              </h1>

              <p
                className="muted"
                style={{
                  fontSize: "1.05rem",
                  lineHeight: 1.8,
                  marginBottom: 22,
                  maxWidth: 780,
                }}
              >
                {biography}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gap: 14,
                  marginBottom: 22,
                }}
              >
                {[
                  { label: "PPG", value: statValue((creator as Record<string, unknown>).pointsPerGame) },
                  { label: "APG", value: statValue((creator as Record<string, unknown>).assistsPerGame) },
                  { label: "RPG", value: statValue((creator as Record<string, unknown>).reboundsPerGame) },
                  { label: "Featured", value: creator.featured ? "Yes" : "No" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="card"
                    style={{
                      padding: 18,
                      borderRadius: 22,
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
                      boxShadow: "none",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "2.2rem",
                        fontWeight: 800,
                        lineHeight: 1,
                        marginBottom: 8,
                      }}
                    >
                      {item.value}
                    </div>
                    <div className="muted" style={{ fontSize: "0.95rem" }}>
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="inline-actions" style={{ gap: 10 }}>
                <Link href="/sponsors" className="button">
                  Explore Sponsors
                </Link>
                <Link href="/contact" className="button button-secondary">
                  Book a Collaboration
                </Link>
              </div>
>>>>>>> parent of d975526 (commit)
            </div>
          </div>
          <div className="hero-art">
            <img src={creator.imageUrl || '/assets/resurgence-poster.jpg'} alt={creator.name} />
            <div className="hero-art-copy">
              <div className="badge">{creator.roleLabel}</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: 0 }}>{creator.audience}</h3>
            </div>
          </div>
        </div>
      </section>

<<<<<<< HEAD
      <section className="section">
        <div className="container card-grid grid-2">
          <article className="card">
            <div className="section-kicker">Platform Focus</div>
            <h2 style={{ marginTop: 0 }}>What this creator brings</h2>
            <p className="section-copy">{creator.platformFocus}</p>
          </article>
          <article className="card">
            <div className="section-kicker">Journey Story</div>
            <h2 style={{ marginTop: 0 }}>How the creator journey evolved</h2>
            <p className="section-copy">{creator.journeyStory || 'Creator story will appear here once updated from the admin dashboard.'}</p>
          </article>
        </div>
      </section>

      <CreatorAnalyticsPanel creator={creator} events={orderedEvents.map((event) => ({
        id: event.id,
        title: event.title,
        eventDate: event.eventDate,
        mediaItems: event.mediaItems.map((item) => ({ mediaType: item.mediaType })),
      }))} />

      <section className="section">
        <div className="container">
          <div className="section-kicker">Creator Media Gallery</div>
          <h2 className="section-title">Event-based multi-image carousels</h2>
          <div className="card-grid grid-1" style={{ marginTop: 24 }}>
            {orderedEvents.map((event) => (
              <article className="card" key={event.id}>
                <div className="section-kicker">{event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'Gallery Event'}</div>
                <h3 style={{ marginTop: 0 }}>{event.title}</h3>
                <p className="section-copy">{event.description || 'No description available.'}</p>
                <div style={{ marginTop: 18 }}>
                  <EventMediaCarousel
                    items={event.mediaItems.map((item) => ({
                      id: item.id,
                      mediaType: item.mediaType,
                      url: item.url,
                      thumbnailUrl: item.thumbnailUrl,
                      caption: item.caption,
                    }))}
                    eventTitle={event.title}
                  />
                </div>
              </article>
            ))}
            {!orderedEvents.length ? <div className="card">No media events linked yet.</div> : null}
          </div>
        </div>
      </section>
    </main>
=======
        <section className="grid-2">
          <div className="card" style={{ padding: 26 }}>
            <div className="eyebrow">Professional Summary</div>
            <h2 style={{ marginTop: 0, marginBottom: 12 }}>Brand positioning and creator value</h2>
            <p className="muted" style={{ lineHeight: 1.8 }}>
              {biography}
            </p>

            <div
              style={{
                marginTop: 18,
                padding: 16,
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.025)",
              }}
            >
              <strong style={{ display: "block", marginBottom: 8 }}>Engagement Fit</strong>
              <div className="muted" style={{ lineHeight: 1.7 }}>
                Ideal for sponsorship storytelling, event activations, branded creator campaigns,
                and audience-facing sports-business promotions.
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 26 }}>
            <div className="eyebrow">Journey Story</div>
            <h2 style={{ marginTop: 0, marginBottom: 12 }}>Career journey and creator narrative</h2>
            <p className="muted" style={{ lineHeight: 1.9, whiteSpace: "pre-wrap" }}>
              {journeyStory || "Journey story details will be added to strengthen the creator narrative and sponsorship pitch."}
            </p>
          </div>
        </section>

        <section className="grid-2 section">
          <div className="card" style={{ padding: 26 }}>
            <div className="eyebrow">Performance Snapshot</div>
            <h2 style={{ marginTop: 0, marginBottom: 14 }}>At-a-glance metrics</h2>

            <div className="list-stack">
              {[
                { label: "Points Per Game", value: statValue((creator as Record<string, unknown>).pointsPerGame) },
                { label: "Assists Per Game", value: statValue((creator as Record<string, unknown>).assistsPerGame) },
                { label: "Rebounds Per Game", value: statValue((creator as Record<string, unknown>).reboundsPerGame) },
                { label: "Featured Status", value: creator.featured ? "Featured creator" : "Standard listing" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="list-item"
                  style={{
                    alignItems: "flex-start",
                    padding: "16px 18px",
                  }}
                >
                  <div>
                    <strong style={{ display: "block", marginBottom: 6 }}>{item.label}</strong>
                    <div className="muted">RESURGENCE creator dashboard record</div>
                  </div>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: "1.1rem",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: 26 }}>
            <div className="eyebrow">Social Links</div>
            <h2 style={{ marginTop: 0, marginBottom: 14 }}>Public channels and reach points</h2>

            {socialLinks.length ? (
              <div className="list-stack">
                {socialLinks.map((link, index) => (
                  <a
                    key={`${link.label}-${index}`}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="list-item"
                    style={{
                      padding: "16px 18px",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong style={{ display: "block", marginBottom: 6 }}>
                        {link.label || "Profile"}
                      </strong>
                      <div className="muted" style={{ wordBreak: "break-all" }}>
                        {link.url}
                      </div>
                    </div>
                    <span className="button button-secondary button-small">Open</span>
                  </a>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                No social links have been published for this creator yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
>>>>>>> parent of d975526 (commit)
  );
}
