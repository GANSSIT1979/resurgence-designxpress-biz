import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CreatorAnalyticsPanel } from '@/components/creator-analytics-panel';
import { CreatorProfileDashboard } from '@/components/creator/creator-profile-dashboard';
import { EventMediaCarousel } from '@/components/event-media-carousel';
import { serializeCreatorProfile } from '@/lib/creators';
import { getCreatorBySlug } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function CreatorPublicProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const creator = await getCreatorBySlug(slug);

  if (!creator || !creator.isActive) notFound();

  const orderedEvents = [...creator.mediaEvents].sort((left, right) => {
    const leftDate = left.eventDate ? new Date(left.eventDate).getTime() : 0;
    const rightDate = right.eventDate ? new Date(right.eventDate).getTime() : 0;
    return rightDate - leftDate;
  });

  return (
    <main>
      <CreatorProfileDashboard creator={serializeCreatorProfile(creator)} />

      <CreatorAnalyticsPanel creator={creator} events={orderedEvents.map((event) => ({
        id: event.id,
        title: event.title,
        eventDate: event.eventDate,
        mediaItems: event.mediaItems.map((item) => ({ mediaType: item.mediaType })),
      }))} />

      <section className="section">
        <div className="container">
          <div className="section-kicker">Creator Media Gallery</div>
          <h2 className="section-title">Event-based highlights and campaign media</h2>
          <p className="section-copy" style={{ maxWidth: 760 }}>
            View creator-linked event media, native videos, and embeds managed from the Resurgence admin gallery.
          </p>
          <div className="card-grid" style={{ marginTop: 24 }}>
            {orderedEvents.map((event) => (
              <article className="card" key={event.id}>
                <div className="section-kicker">{event.eventDate ? new Date(event.eventDate).toLocaleDateString('en-PH') : 'Gallery Event'}</div>
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
            {!orderedEvents.length ? <div className="empty-state">No media events linked yet.</div> : null}
          </div>
          <div className="btn-row" style={{ marginTop: 24 }}>
            <Link className="button-link btn-secondary" href="/creators">Back to Creators</Link>
            <Link className="button-link" href="/contact">Contact Partnerships</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
