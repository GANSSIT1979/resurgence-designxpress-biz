'use client';

import { useEffect, useRef } from 'react';

export default function ViewportViewTracker({
  postId,
  onEnterViewport,
  threshold = 0.72,
  className = '',
}: {
  postId: string;
  onEnterViewport: () => void;
  threshold?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting && entry.intersectionRatio >= threshold && !hasTriggeredRef.current) {
          hasTriggeredRef.current = true;
          onEnterViewport();
        }
      },
      { threshold: [threshold] },
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [onEnterViewport, postId, threshold]);

  return <div ref={ref} className={className} aria-hidden="true" />;
}
