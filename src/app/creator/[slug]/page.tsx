import Link from 'next/link';
import { getCreatorBySlug } from '@/lib/site';
import { EventMediaCarousel } from '@/components/event-media-carousel';
import { CreatorAnalyticsPanel } from '@/components/creator-analytics-panel';

export const dynamic = 'force-dynamic';

export default async function CreatorDashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const creator = await getCreatorBySlug(slug);

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
  );
}
