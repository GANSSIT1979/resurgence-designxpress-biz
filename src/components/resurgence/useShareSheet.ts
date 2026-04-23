'use client';

import { useCallback, useMemo, useState } from 'react';
import { buildExternalShareLinks, buildSharePayload } from '@/lib/share/buildSharePayload';
import { copyShareLink } from '@/lib/share/copyShareLink';
import { trackPostShare } from '@/lib/share/trackPostShare';
import type {
  ShareSheetContext,
  ShareTrackAction,
  ShareableFeedItem,
} from '@/lib/share/types';

export type ShareToast = {
  id: string;
  message: string;
  tone?: 'success' | 'error' | 'info';
};

export function useShareSheet({
  context = {},
  onShareCountChange,
}: {
  context?: ShareSheetContext;
  onShareCountChange?: (postId: string, shareCount: number) => void;
} = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [activeItem, setActiveItem] = useState<ShareableFeedItem | null>(null);
  const [toast, setToast] = useState<ShareToast | null>(null);

  const resolvedContext = useMemo<ShareSheetContext>(() => {
    if (context.origin) return context;
    if (typeof window === 'undefined') return context;
    return { ...context, origin: window.location.origin };
  }, [context]);

  const payload = useMemo(
    () => (activeItem ? buildSharePayload(activeItem, resolvedContext) : null),
    [activeItem, resolvedContext],
  );

  const externalLinks = useMemo(
    () => (payload ? buildExternalShareLinks(payload) : null),
    [payload],
  );

  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const pushToast = useCallback((message: string, tone: ShareToast['tone'] = 'info') => {
    setToast({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      message,
      tone,
    });
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  const open = useCallback((item: ShareableFeedItem) => {
    setActiveItem(item);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setActiveItem(null);
  }, []);

  const record = useCallback(
    async (action: ShareTrackAction, destination?: string | null) => {
      if (!activeItem?.id) return null;

      try {
        const result = await trackPostShare(activeItem.id, { action, destination });
        if (typeof result?.shareCount === 'number') {
          onShareCountChange?.(activeItem.id, result.shareCount);
        }
        return result;
      } catch {
        return null;
      }
    },
    [activeItem?.id, onShareCountChange],
  );

  const nativeShare = useCallback(async () => {
    if (!payload) return;

    if (!canNativeShare || typeof navigator === 'undefined' || !navigator.share) {
      pushToast('Native sharing is not available on this device.', 'error');
      return;
    }

    setIsBusy(true);

    try {
      await navigator.share({
        title: payload.title,
        text: payload.text,
        url: payload.url,
      });

      await record('native-share', payload.url);
      pushToast('Post shared successfully.', 'success');
      close();
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      pushToast(error instanceof Error ? error.message : 'Unable to open the device share sheet.', 'error');
    } finally {
      setIsBusy(false);
    }
  }, [canNativeShare, close, payload, pushToast, record]);

  const copyLinkToClipboard = useCallback(async () => {
    if (!payload) return;

    setIsBusy(true);
    try {
      await copyShareLink(payload.url);
      await record('copy-link', payload.url);
      pushToast('Share link copied.', 'success');
      close();
    } catch (error) {
      pushToast(error instanceof Error ? error.message : 'Unable to copy the share link.', 'error');
    } finally {
      setIsBusy(false);
    }
  }, [close, payload, pushToast, record]);

  const openCreator = useCallback(() => {
    if (!payload?.creatorUrl) {
      pushToast('Creator profile link unavailable for this post.', 'error');
      return;
    }

    void record('open-creator', payload.creatorUrl);
    close();
    if (typeof window !== 'undefined') {
      window.location.href = payload.creatorUrl;
    }
  }, [close, payload?.creatorUrl, pushToast, record]);

  const openProduct = useCallback(() => {
    if (!payload?.productUrl) {
      pushToast('Tagged product link unavailable for this post.', 'error');
      return;
    }

    void record('open-product', payload.productUrl);
    close();
    if (typeof window !== 'undefined') {
      window.location.href = payload.productUrl;
    }
  }, [close, payload?.productUrl, pushToast, record]);

  const openExternal = useCallback((url: string) => {
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
    void record('external-share', url);
    close();
  }, [close, record]);

  return {
    isOpen,
    isBusy,
    activeItem,
    payload,
    externalLinks,
    toast,
    canNativeShare,
    open,
    close,
    clearToast,
    nativeShare,
    copyLink: copyLinkToClipboard,
    openCreator,
    openProduct,
    openExternal,
  };
}
