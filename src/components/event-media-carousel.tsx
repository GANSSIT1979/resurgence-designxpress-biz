'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type CarouselMediaItem = {
  id?: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'YOUTUBE' | 'VIMEO' | string;
  url: string;
  thumbnailUrl?: string | null;
  caption?: string | null;
};

export function EventMediaCarousel({
  items,
  eventTitle,
  active = false,
  tall = false,
}: {
  items: CarouselMediaItem[];
  eventTitle: string;
  active?: boolean;
  tall?: boolean;
}) {
  const safeItems = useMemo(() => items.filter((item) => item?.url), [items]);
  const [index, setIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    setIndex(0);
  }, [safeItems.length]);

  useEffect(() => {
    const current = safeItems[index];
    const video = videoRef.current;
    if (!video) return;

    if (active && current?.mediaType === 'VIDEO') {
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      const promise = video.play();
      if (promise && typeof promise.catch === 'function') promise.catch(() => {});
    } else {
      video.pause();
    }
  }, [active, index, safeItems]);

  if (!safeItems.length) {
    return <div className={`event-media-shell ${tall ? 'tall' : ''}`}><div className="empty-state">No media added yet.</div></div>;
  }

  const current = safeItems[index];
  const total = safeItems.length;

  function prev() {
    setIndex((currentIndex) => (currentIndex === 0 ? total - 1 : currentIndex - 1));
  }

  function next() {
    setIndex((currentIndex) => (currentIndex === total - 1 ? 0 : currentIndex + 1));
  }

  return (
    <div className={`event-media-shell ${tall ? 'tall' : ''}`}>
      <div className="event-media-stage">
        {renderMedia(current, eventTitle, videoRef)}
      </div>

      {total > 1 ? (
        <>
          <button className="carousel-control left" type="button" onClick={prev} aria-label="Previous media">
            ‹
          </button>
          <button className="carousel-control right" type="button" onClick={next} aria-label="Next media">
            ›
          </button>
        </>
      ) : null}

      <div className="carousel-meta">
        <div className="helper">{index + 1} / {total}</div>
        {current.caption ? <div className="helper">{current.caption}</div> : null}
      </div>

      {total > 1 ? (
        <div className="carousel-dots">
          {safeItems.map((item, itemIndex) => (
            <button
              key={item.id || `${item.url}-${itemIndex}`}
              type="button"
              className={itemIndex === index ? 'active' : undefined}
              onClick={() => setIndex(itemIndex)}
              aria-label={`Go to media ${itemIndex + 1}`}
            />
          ))}
        </div>
      ) : null}

      {total > 1 ? (
        <div className="carousel-thumb-row">
          {safeItems.map((item, itemIndex) => (
            <button
              key={`thumb-${item.id || itemIndex}`}
              type="button"
              className={itemIndex === index ? 'active' : undefined}
              onClick={() => setIndex(itemIndex)}
              aria-label={`Open media ${itemIndex + 1}`}
            >
              {renderThumb(item, eventTitle)}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function renderMedia(
  item: CarouselMediaItem,
  eventTitle: string,
  videoRef: React.MutableRefObject<HTMLVideoElement | null>,
) {
  switch (item.mediaType) {
    case 'IMAGE':
      return <img className="event-media-asset" src={item.url} alt={item.caption || eventTitle} />;
    case 'VIDEO':
      return (
        <video
          ref={videoRef}
          className="event-media-asset"
          controls
          muted
          loop
          playsInline
          preload="metadata"
          poster={item.thumbnailUrl || undefined}
          src={item.url}
        />
      );
    case 'YOUTUBE':
      return (
        <iframe
          className="event-media-asset event-media-frame"
          src={`https://www.youtube.com/embed/${extractYouTubeId(item.url)}?rel=0&modestbranding=1&playsinline=1`}
          title={item.caption || eventTitle}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      );
    case 'VIMEO':
      return (
        <iframe
          className="event-media-asset event-media-frame"
          src={`https://player.vimeo.com/video/${extractVimeoId(item.url)}`}
          title={item.caption || eventTitle}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      );
    default:
      return <img className="event-media-asset" src={item.thumbnailUrl || item.url} alt={item.caption || eventTitle} />;
  }
}

function renderThumb(item: CarouselMediaItem, eventTitle: string) {
  if (item.mediaType === 'IMAGE') {
    return <img src={item.thumbnailUrl || item.url} alt={item.caption || eventTitle} />;
  }

  if (item.mediaType === 'VIDEO') {
    return (
      <div className="thumb-frame">
        <img src={item.thumbnailUrl || '/assets/resurgence-poster.jpg'} alt={item.caption || eventTitle} />
        <span>VIDEO</span>
      </div>
    );
  }

  if (item.mediaType === 'YOUTUBE' || item.mediaType === 'VIMEO') {
    return (
      <div className="thumb-frame">
        <img src={item.thumbnailUrl || '/assets/resurgence-logo.jpg'} alt={item.caption || eventTitle} />
        <span>{item.mediaType}</span>
      </div>
    );
  }

  return <img src={item.thumbnailUrl || item.url} alt={item.caption || eventTitle} />;
}

function extractYouTubeId(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{6,})/);
  return match?.[1] || url;
}

function extractVimeoId(url: string) {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match?.[1] || url;
}
