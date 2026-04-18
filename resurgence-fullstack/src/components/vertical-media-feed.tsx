'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { EventMediaCarousel } from '@/components/event-media-carousel';

type FeedEvent = {
  id: string;
  title: string;
  description: string | null;
  eventDate: string | null;
  creator?: { name?: string | null; slug?: string | null; roleLabel?: string | null } | null;
  mediaItems: Array<{
    id: string;
    mediaType: string;
    url: string;
    thumbnailUrl: string | null;
    caption: string | null;
  }>;
};

function formatEventDate(dateValue?: string | null) {
  if (!dateValue) return '';

  const date = new Date(dateValue);

  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function VerticalMediaFeed({ events }: { events: FeedEvent[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const cardRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        const index = Number((visible.target as HTMLElement).dataset.index || 0);
        setActiveIndex(index);
      },
      { threshold: [0.45, 0.6, 0.8] },
    );

    cardRefs.current.forEach((node) => {
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [events.length]);

  const safeEvents = useMemo(
    () => events.filter((event) => event.mediaItems.length),
    [events],
  );

  return (
    <div className="vertical-feed-shell">
      <div className="vertical-feed-phone">
        {safeEvents.map((event, index) => (
          <article
            key={event.id}
            ref={(node) => {
              cardRefs.current[index] = node;
            }}
            data-index={index}
            className={`vertical-feed-card ${index === activeIndex ? 'active' : ''}`}
          >
            <EventMediaCarousel
              items={event.mediaItems}
              eventTitle={event.title}
              active={index === activeIndex}
              tall
            />

            <div className="vertical-feed-overlay">
              <div className="section-kicker">
                {event.creator?.name || 'RESURGENCE Event'}
              </div>

              <h3>{event.title}</h3>

              <p>{event.description || 'No description available yet.'}</p>

              <div className="vertical-feed-meta">
                {event.eventDate ? <span>{formatEventDate(event.eventDate)}</span> : null}
                {event.creator?.roleLabel ? <span>{event.creator.roleLabel}</span> : null}
              </div>

              {event.creator?.slug ? (
                <div className="btn-row" style={{ marginTop: 12 }}>
                  <Link
                    href={`/creator/${event.creator.slug}`}
                    className="button-link"
                  >
                    Open Creator Dashboard
                  </Link>
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}