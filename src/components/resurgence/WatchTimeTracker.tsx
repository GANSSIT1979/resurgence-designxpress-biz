'use client';

import { useEffect, useRef } from 'react';

export default function WatchTimeTracker({
  isPlaying,
  onActiveChange,
  onCompleted,
  completionRatio = 0.9,
  currentTimeSeconds,
  durationSeconds,
}: {
  isPlaying: boolean;
  onActiveChange: (active: boolean) => void;
  onCompleted?: () => void;
  completionRatio?: number;
  currentTimeSeconds?: number;
  durationSeconds?: number | null;
}) {
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    onActiveChange(Boolean(isPlaying));
    return () => onActiveChange(false);
  }, [isPlaying, onActiveChange]);

  useEffect(() => {
    if (!onCompleted || hasCompletedRef.current) return;
    if (!durationSeconds || durationSeconds <= 0 || currentTimeSeconds === undefined) return;
    if (currentTimeSeconds / durationSeconds >= completionRatio) {
      hasCompletedRef.current = true;
      onCompleted();
    }
  }, [completionRatio, currentTimeSeconds, durationSeconds, onCompleted]);

  return null;
}
