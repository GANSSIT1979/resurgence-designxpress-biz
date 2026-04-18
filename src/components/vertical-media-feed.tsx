'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { MutableRefObject } from 'react';
import Link from 'next/link';

type FeedMediaItem = {
  id: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'YOUTUBE' | 'VIMEO' | string;
  url: string;
  thumbnailUrl: string | null;
  caption: string | null;
};

type FeedEvent = {
  id: string;
  title: string;
  description: string | null;
  eventDate: string | null;
  creator?: { name?: string | null; slug?: string | null; roleLabel?: string | null } | null;
  mediaItems: FeedMediaItem[];
};

type FeedCardProps = {
  active: boolean;
  event: FeedEvent;
  index: number;
  mediaIndex: number;
  muted: boolean;
  onMediaIndexChange: (index: number) => void;
  onNextCard: () => void;
  onPreviousCard: () => void;
  paused: boolean;
  setMuted: (value: boolean) => void;
  setPaused: (value: boolean) => void;
  totalEvents: number;
};

const imageAutoAdvanceMs = 6500;

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

function formatMediaType(mediaType: string) {
  if (mediaType === 'YOUTUBE') return 'YouTube';
  if (mediaType === 'VIMEO') return 'Vimeo';
  return mediaType.charAt(0).toUpperCase() + mediaType.slice(1).toLowerCase();
}

function isNativeVideo(item: FeedMediaItem) {
  return item.mediaType === 'VIDEO';
}

function isExternalVideo(item: FeedMediaItem) {
  return item.mediaType === 'YOUTUBE' || item.mediaType === 'VIMEO';
}

function getYouTubeId(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/);
  return match?.[1] || '';
}

function getVimeoId(url: string) {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match?.[1] || '';
}

function getEmbedUrl(item: FeedMediaItem, active: boolean) {
  if (item.mediaType === 'YOUTUBE') {
    const id = getYouTubeId(item.url);
    if (!id) return '';
    const params = new URLSearchParams({
      rel: '0',
      modestbranding: '1',
      playsinline: '1',
      controls: '1',
    });
    if (active) {
      params.set('autoplay', '1');
      params.set('mute', '1');
    }
    return `https://www.youtube.com/embed/${id}?${params.toString()}`;
  }

  if (item.mediaType === 'VIMEO') {
    const id = getVimeoId(item.url);
    if (!id) return '';
    const params = new URLSearchParams({
      playsinline: '1',
      title: '0',
      byline: '0',
      portrait: '0',
    });
    if (active) {
      params.set('autoplay', '1');
      params.set('muted', '1');
    }
    return `https://player.vimeo.com/video/${id}?${params.toString()}`;
  }

  return '';
}

export function VerticalMediaFeed({ events }: { events: FeedEvent[] }) {
  const safeEvents = useMemo(
    () => events.filter((event) => event.mediaItems.some((item) => item.url)),
    [events],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [mediaIndexes, setMediaIndexes] = useState<Record<string, number>>({});
  const cardRefs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    setActiveIndex(0);
    setPaused(false);
  }, [safeEvents.length]);

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
      { rootMargin: '-18% 0px -18% 0px', threshold: [0.45, 0.6, 0.8] },
    );

    cardRefs.current.forEach((node) => {
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [safeEvents.length]);

  useEffect(() => {
    setPaused(false);
  }, [activeIndex]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName;
      if (tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT' || target?.isContentEditable) {
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        scrollToCard(activeIndex + 1);
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        scrollToCard(activeIndex - 1);
      } else if (event.key === ' ') {
        event.preventDefault();
        setPaused((current) => !current);
      } else if (event.key.toLowerCase() === 'm') {
        setMuted((current) => !current);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        shiftActiveMedia(1);
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        shiftActiveMedia(-1);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeIndex, safeEvents, mediaIndexes]);

  function scrollToCard(nextIndex: number) {
    const boundedIndex = Math.max(0, Math.min(nextIndex, safeEvents.length - 1));
    cardRefs.current[boundedIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function setMediaIndexForEvent(eventId: string, nextIndex: number) {
    setMediaIndexes((current) => ({ ...current, [eventId]: nextIndex }));
  }

  function shiftActiveMedia(direction: 1 | -1) {
    const event = safeEvents[activeIndex];
    if (!event) return;

    const total = event.mediaItems.filter((item) => item.url).length;
    if (total <= 1) return;

    const currentIndex = mediaIndexes[event.id] ?? 0;
    const nextIndex = direction === 1
      ? (currentIndex + 1) % total
      : currentIndex === 0 ? total - 1 : currentIndex - 1;

    setMediaIndexForEvent(event.id, nextIndex);
    setPaused(false);
  }

  if (!safeEvents.length) {
    return (
      <div className="vertical-feed-shell">
        <div className="vertical-feed-empty">
          <div className="section-kicker">Media Feed</div>
          <h3>No media stories published yet.</h3>
          <p className="helper">Add active gallery events with images, videos, YouTube, or Vimeo links from the admin gallery module.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vertical-feed-shell">
      <aside className="vertical-feed-dock" aria-label="Feed controls">
        <button type="button" onClick={() => scrollToCard(activeIndex - 1)} disabled={activeIndex === 0}>
          Previous
        </button>
        <div className="vertical-feed-dock-count">
          <strong>{activeIndex + 1}</strong>
          <span>/ {safeEvents.length}</span>
        </div>
        <button type="button" onClick={() => scrollToCard(activeIndex + 1)} disabled={activeIndex === safeEvents.length - 1}>
          Next
        </button>
      </aside>

      <div className="vertical-feed-phone" aria-label="Vertical media feed">
        {safeEvents.map((event, index) => {
          const mediaCount = event.mediaItems.filter((item) => item.url).length;
          const currentMediaIndex = Math.min(mediaIndexes[event.id] ?? 0, Math.max(mediaCount - 1, 0));

          return (
            <FeedCard
              active={index === activeIndex}
              event={event}
              index={index}
              key={event.id}
              mediaIndex={currentMediaIndex}
              muted={muted}
              onMediaIndexChange={(nextIndex) => setMediaIndexForEvent(event.id, nextIndex)}
              onNextCard={() => scrollToCard(index + 1)}
              onPreviousCard={() => scrollToCard(index - 1)}
              paused={paused}
              refCallback={(node) => {
                cardRefs.current[index] = node;
              }}
              setMuted={setMuted}
              setPaused={setPaused}
              totalEvents={safeEvents.length}
            />
          );
        })}
      </div>

      <div className="vertical-feed-keyboard-hints" aria-hidden="true">
        <span>Space: play/pause</span>
        <span>M: mute</span>
        <span>Arrows: navigate</span>
      </div>
    </div>
  );
}

function FeedCard({
  active,
  event,
  index,
  mediaIndex,
  muted,
  onMediaIndexChange,
  onNextCard,
  onPreviousCard,
  paused,
  refCallback,
  setMuted,
  setPaused,
  totalEvents,
}: FeedCardProps & { refCallback: (node: HTMLElement | null) => void }) {
  const mediaItems = useMemo(() => event.mediaItems.filter((item) => item.url), [event.mediaItems]);
  const current = mediaItems[mediaIndex] ?? mediaItems[0];
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
  }, [current?.id, mediaIndex]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !current || !isNativeVideo(current)) return;

    video.muted = muted;
    video.loop = false;
    video.playsInline = true;

    if (active && !paused) {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          setPaused(true);
        });
      }
    } else {
      video.pause();
    }
  }, [active, current, muted, paused, setPaused]);

  useEffect(() => {
    if (!active || !current || isNativeVideo(current) || isExternalVideo(current) || paused) return;

    const startedAt = Date.now();
    const timer = window.setInterval(() => {
      const nextProgress = Math.min(((Date.now() - startedAt) / imageAutoAdvanceMs) * 100, 100);
      setProgress(nextProgress);

      if (nextProgress >= 100) {
        window.clearInterval(timer);
        goNextMedia();
      }
    }, 80);

    return () => window.clearInterval(timer);
  }, [active, current, mediaIndex, paused]);

  function goPreviousMedia() {
    if (mediaItems.length <= 1) return;
    onMediaIndexChange(mediaIndex === 0 ? mediaItems.length - 1 : mediaIndex - 1);
    setPaused(false);
  }

  function goNextMedia() {
    if (mediaItems.length <= 1) {
      onNextCard();
      return;
    }
    onMediaIndexChange(mediaIndex === mediaItems.length - 1 ? 0 : mediaIndex + 1);
    setPaused(false);
  }

  function onVideoTimeUpdate() {
    const video = videoRef.current;
    if (!video?.duration) return;
    setProgress(Math.min((video.currentTime / video.duration) * 100, 100));
  }

  function togglePlayback() {
    if (!current) return;
    if (isExternalVideo(current)) return;
    setPaused(!paused);
  }

  const formattedDate = formatEventDate(event.eventDate);
  const creatorName = event.creator?.name || 'RESURGENCE Event';
  const mediaType = current ? formatMediaType(current.mediaType) : 'Media';

  return (
    <article
      className={`vertical-feed-card ${active ? 'active' : ''}`}
      data-index={index}
      ref={refCallback}
    >
      <div className="vertical-feed-progress" aria-label="Media progress">
        {mediaItems.map((item, itemIndex) => (
          <button
            aria-label={`Open media item ${itemIndex + 1}`}
            className={itemIndex === mediaIndex ? 'active' : undefined}
            key={item.id || `${item.url}-${itemIndex}`}
            onClick={() => onMediaIndexChange(itemIndex)}
            type="button"
          >
            <span style={{ width: itemIndex === mediaIndex ? `${progress}%` : itemIndex < mediaIndex ? '100%' : '0%' }} />
          </button>
        ))}
      </div>

      <div className="vertical-feed-stage" onClick={togglePlayback}>
        {current ? renderFeedMedia(current, event.title, active, paused, muted, videoRef, onVideoTimeUpdate, goNextMedia) : null}
        {!current ? <div className="vertical-feed-missing">No media available.</div> : null}

        {!paused || isExternalVideo(current) ? null : (
          <div className="vertical-feed-play-state" aria-hidden="true">
            <span>Paused</span>
          </div>
        )}
      </div>

      <div className="vertical-feed-topbar">
        <span>{mediaType}</span>
        <span>{mediaIndex + 1} / {mediaItems.length}</span>
      </div>

      <div className="vertical-feed-actions" aria-label="Media actions">
        <button type="button" onClick={() => setMuted(!muted)} aria-label={muted ? 'Unmute video feed' : 'Mute video feed'}>
          <strong>{muted ? 'Muted' : 'Sound'}</strong>
          <span>Audio</span>
        </button>
        <button type="button" onClick={togglePlayback} disabled={isExternalVideo(current)} aria-label={paused ? 'Play media' : 'Pause media'}>
          <strong>{paused ? 'Play' : 'Pause'}</strong>
          <span>State</span>
        </button>
        <button type="button" onClick={goPreviousMedia} disabled={mediaItems.length <= 1} aria-label="Previous media item">
          <strong>Prev</strong>
          <span>Clip</span>
        </button>
        <button type="button" onClick={goNextMedia} aria-label="Next media item">
          <strong>Next</strong>
          <span>{mediaItems.length > 1 ? 'Clip' : 'Post'}</span>
        </button>
      </div>

      <div className="vertical-feed-overlay">
        <div className="vertical-feed-creator-line">
          <span>{creatorName}</span>
          {event.creator?.roleLabel ? <span>{event.creator.roleLabel}</span> : null}
        </div>

        <h3>{event.title}</h3>
        <p>{current?.caption || event.description || 'No description available yet.'}</p>

        <div className="vertical-feed-meta">
          {formattedDate ? <span>{formattedDate}</span> : null}
          <span>Post {index + 1} of {totalEvents}</span>
          <span>{mediaItems.length} media item{mediaItems.length === 1 ? '' : 's'}</span>
        </div>

        <div className="vertical-feed-cta-row">
          {event.creator?.slug ? (
            <Link href={`/creator/${event.creator.slug}`} className="button-link">
              View Creator Profile
            </Link>
          ) : null}
          <Link href="/contact" className="button-link btn-secondary">
            Contact Team
          </Link>
        </div>
      </div>

      <div className="vertical-feed-card-nav">
        <button type="button" onClick={onPreviousCard} disabled={index === 0} aria-label="Previous feed post">
          Up
        </button>
        <button type="button" onClick={onNextCard} disabled={index === totalEvents - 1} aria-label="Next feed post">
          Down
        </button>
      </div>
    </article>
  );
}

function renderFeedMedia(
  item: FeedMediaItem,
  eventTitle: string,
  active: boolean,
  paused: boolean,
  muted: boolean,
  videoRef: MutableRefObject<HTMLVideoElement | null>,
  onVideoTimeUpdate: () => void,
  onVideoEnded: () => void,
) {
  if (item.mediaType === 'IMAGE') {
    return (
      <img
        className="vertical-feed-media"
        src={item.url}
        alt={item.caption || eventTitle}
        loading={active ? 'eager' : 'lazy'}
      />
    );
  }

  if (item.mediaType === 'VIDEO') {
    return (
      <video
        className="vertical-feed-media"
        controls={false}
        loop={false}
        muted={muted}
        onEnded={onVideoEnded}
        onTimeUpdate={onVideoTimeUpdate}
        playsInline
        poster={item.thumbnailUrl || undefined}
        preload={active ? 'auto' : 'metadata'}
        ref={videoRef}
        src={item.url}
      />
    );
  }

  if (item.mediaType === 'YOUTUBE' || item.mediaType === 'VIMEO') {
    const embedUrl = getEmbedUrl(item, active && !paused);
    if (!embedUrl) {
      return <div className="vertical-feed-missing">Unable to load embedded media.</div>;
    }

    return (
      <iframe
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="vertical-feed-media vertical-feed-embed"
        src={embedUrl}
        title={item.caption || eventTitle}
      />
    );
  }

  return (
    <img
      className="vertical-feed-media"
      src={item.thumbnailUrl || item.url}
      alt={item.caption || eventTitle}
      loading={active ? 'eager' : 'lazy'}
    />
  );
}
