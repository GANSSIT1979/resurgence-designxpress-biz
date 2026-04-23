'use client';

import type { ShareSheetContext, ShareableFeedItem } from '@/lib/share/types';
import { ShareSheetModal } from './ShareSheetModal';
import { ShareSheetToastViewport } from './ShareSheetToastViewport';
import { useShareSheet } from './useShareSheet';

export function ShareSheetTrigger({
  item,
  context,
  count,
  compact = false,
  onShareCountChange,
}: {
  item: ShareableFeedItem;
  context?: ShareSheetContext;
  count?: number;
  compact?: boolean;
  onShareCountChange?: (postId: string, shareCount: number) => void;
}) {
  const sheet = useShareSheet({ context, onShareCountChange });

  return (
    <>
      <button
        type="button"
        className={compact ? 'share-sheet-trigger share-sheet-trigger-compact' : 'share-sheet-trigger'}
        onClick={() => sheet.open(item)}
      >
        <strong>Share</strong>
        <span>{typeof count === 'number' ? count : 'Open'}</span>
      </button>

      <ShareSheetModal
        open={sheet.isOpen}
        busy={sheet.isBusy}
        canNativeShare={sheet.canNativeShare}
        payload={sheet.payload}
        externalLinks={sheet.externalLinks}
        onClose={sheet.close}
        onNativeShare={sheet.nativeShare}
        onCopyLink={sheet.copyLink}
        onOpenCreator={sheet.openCreator}
        onOpenProduct={sheet.openProduct}
        onOpenExternal={sheet.openExternal}
      />

      <ShareSheetToastViewport toast={sheet.toast} onDismiss={sheet.clearToast} />
    </>
  );
}
