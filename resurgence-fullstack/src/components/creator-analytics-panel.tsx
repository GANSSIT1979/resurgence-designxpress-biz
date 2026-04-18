import { formatDate } from '@/lib/partner';

type AnalyticsMediaItem = { mediaType: string };
type AnalyticsEvent = { id: string; title: string; eventDate: string | Date | null; mediaItems: AnalyticsMediaItem[] };

export function CreatorAnalyticsPanel({
  creator,
  events,
}: {
  creator: {
    pointsPerGame: number | null;
    assistsPerGame: number | null;
    reboundsPerGame: number | null;
  };
  events: AnalyticsEvent[];
}) {
  const totalEvents = events.length;
  const totalMedia = events.reduce((sum, event) => sum + event.mediaItems.length, 0);
  const imageCount = events.reduce((sum, event) => sum + event.mediaItems.filter((item) => item.mediaType === 'IMAGE').length, 0);
  const nativeVideoCount = events.reduce((sum, event) => sum + event.mediaItems.filter((item) => item.mediaType === 'VIDEO').length, 0);
  const embedCount = events.reduce((sum, event) => sum + event.mediaItems.filter((item) => item.mediaType === 'YOUTUBE' || item.mediaType === 'VIMEO').length, 0);
  const latestEvent = events[0];
  const performanceIndex = Math.round(((creator.pointsPerGame || 0) * 1.2) + ((creator.assistsPerGame || 0) * 1.4) + ((creator.reboundsPerGame || 0) * 1.1));

  const maxMediaType = Math.max(imageCount, nativeVideoCount, embedCount, 1);

  return (
    <section className="section" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="container">
        <div className="section-kicker">Creator Analytics Dashboard</div>
        <h2 className="section-title">Performance, content mix, and activity overview</h2>
        <div className="card-grid grid-4" style={{ marginTop: 24 }}>
          <div className="stat-card"><strong>{totalEvents}</strong><div className="helper">Media events</div></div>
          <div className="stat-card"><strong>{totalMedia}</strong><div className="helper">Total media posts</div></div>
          <div className="stat-card"><strong>{performanceIndex}</strong><div className="helper">Creator performance index</div></div>
          <div className="stat-card"><strong>{latestEvent ? formatDate(latestEvent.eventDate) : '—'}</strong><div className="helper">Latest event</div></div>
        </div>

        <div className="card-grid grid-2" style={{ marginTop: 20 }}>
          <article className="card">
            <div className="section-kicker">On-court stats</div>
            <div className="analytics-bars">
              {[
                { label: 'Points Per Game', value: creator.pointsPerGame || 0, max: 40 },
                { label: 'Assists Per Game', value: creator.assistsPerGame || 0, max: 15 },
                { label: 'Rebounds Per Game', value: creator.reboundsPerGame || 0, max: 20 },
              ].map((metric) => (
                <div key={metric.label} className="analytics-row">
                  <div className="helper">{metric.label}</div>
                  <div className="analytics-track"><span style={{ width: `${Math.min((metric.value / metric.max) * 100, 100)}%` }} /></div>
                  <strong>{metric.value}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="card">
            <div className="section-kicker">Content mix</div>
            <div className="analytics-bars">
              {[
                { label: 'Images', value: imageCount },
                { label: 'Native Videos', value: nativeVideoCount },
                { label: 'Embeds', value: embedCount },
              ].map((metric) => (
                <div key={metric.label} className="analytics-row">
                  <div className="helper">{metric.label}</div>
                  <div className="analytics-track"><span style={{ width: `${Math.min((metric.value / maxMediaType) * 100, 100)}%` }} /></div>
                  <strong>{metric.value}</strong>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
