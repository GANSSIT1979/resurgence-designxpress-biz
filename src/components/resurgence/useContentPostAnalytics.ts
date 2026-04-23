'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { registerPostView, registerPostWatchTime } from '@/lib/feed-analytics/client';
import type { AnalyticsSnapshot } from '@/lib/feed-analytics/types';

const DEFAULT_ANALYTICS: AnalyticsSnapshot = {
  viewCount: 0,
  uniqueViewCount: 0,
  watchTimeSeconds: 0,
  averageWatchTimeSeconds: 0,
  completionRate: 0,
  shareCount: 0,
  likeCount: 0,
  saveCount: 0,
  commentCount: 0,
  lastViewedAt: null,
};

export function useContentPostAnalytics({
  postId,
  initialAnalytics,
  source = 'feed',
  watchPingIntervalMs = 5000,
  enabled = true,
  onAnalyticsChange,
}: {
  postId: string;
  initialAnalytics?: Partial<AnalyticsSnapshot>;
  source?: string;
  watchPingIntervalMs?: number;
  enabled?: boolean;
  onAnalyticsChange?: (analytics: AnalyticsSnapshot) => void;
}) {
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot>({
    ...DEFAULT_ANALYTICS,
    ...(initialAnalytics || {}),
  });
  const [isActive, setIsActiveState] = useState(false);
  const [hasRegisteredView, setHasRegisteredView] = useState(false);
  const watchIntervalRef = useRef<number | null>(null);
  const hasCompletedRef = useRef(false);

  const applyAnalytics = useCallback(
    (next: Partial<AnalyticsSnapshot>) => {
      setAnalytics((current) => {
        const merged = { ...current, ...next };
        onAnalyticsChange?.(merged);
        return merged;
      });
    },
    [onAnalyticsChange],
  );

  const registerView = useCallback(async () => {
    if (!enabled || hasRegisteredView) return;

    setHasRegisteredView(true);
    applyAnalytics({
      viewCount: analytics.viewCount + 1,
      uniqueViewCount: analytics.uniqueViewCount + 1,
    });

    try {
      const response = await registerPostView(postId, source);
      applyAnalytics(response.analytics);
    } catch {
      setHasRegisteredView(false);
    }
  }, [analytics.uniqueViewCount, analytics.viewCount, applyAnalytics, enabled, hasRegisteredView, postId, source]);

  const markCompleted = useCallback(() => {
    hasCompletedRef.current = true;
  }, []);

  const flushWatchTime = useCallback(
    async (seconds: number) => {
      if (!enabled || !hasRegisteredView || seconds <= 0) return;

      applyAnalytics({
        watchTimeSeconds: analytics.watchTimeSeconds + seconds,
        averageWatchTimeSeconds:
          analytics.viewCount > 0
            ? Number(((analytics.watchTimeSeconds + seconds) / analytics.viewCount).toFixed(2))
            : seconds,
      });

      try {
        const response = await registerPostWatchTime(postId, seconds, hasCompletedRef.current, source);
        applyAnalytics(response.analytics);
        if (hasCompletedRef.current) {
          hasCompletedRef.current = false;
        }
      } catch {
        // Keep the optimistic state. The next ping can resync.
      }
    },
    [analytics.viewCount, analytics.watchTimeSeconds, applyAnalytics, enabled, hasRegisteredView, postId, source],
  );

  const setIsActive = useCallback((nextActive: boolean) => {
    if (!enabled) return;
    setIsActiveState(nextActive);
  }, [enabled]);

  const stopTracking = useCallback(() => {
    if (watchIntervalRef.current) {
      window.clearInterval(watchIntervalRef.current);
      watchIntervalRef.current = null;
    }
    setIsActiveState(false);
  }, []);

  useEffect(() => {
    if (watchIntervalRef.current) {
      window.clearInterval(watchIntervalRef.current);
      watchIntervalRef.current = null;
    }

    if (!enabled || !isActive || !hasRegisteredView) return;

    watchIntervalRef.current = window.setInterval(() => {
      void flushWatchTime(watchPingIntervalMs / 1000);
    }, watchPingIntervalMs);

    return () => {
      if (watchIntervalRef.current) {
        window.clearInterval(watchIntervalRef.current);
        watchIntervalRef.current = null;
      }
    };
  }, [enabled, flushWatchTime, hasRegisteredView, isActive, watchPingIntervalMs]);

  const actions = useMemo(
    () => ({
      registerView,
      markCompleted,
      setIsActive,
      stopTracking,
      applyAnalytics,
    }),
    [applyAnalytics, markCompleted, registerView, setIsActive, stopTracking],
  );

  return {
    analytics,
    isActive,
    hasRegisteredView,
    ...actions,
  };
}
