'use client';

import { useEffect } from 'react';
import type { ShareToast } from './useShareSheet';

export function ShareSheetToastViewport({
  toast,
  onDismiss,
}: {
  toast: ShareToast | null;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(onDismiss, toast.tone === 'error' ? 3400 : 2400);
    return () => window.clearTimeout(timeout);
  }, [onDismiss, toast]);

  if (!toast) return null;

  return (
    <div className="share-sheet-toast-viewport" aria-live="polite" aria-label="Share notifications">
      <button
        type="button"
        className={`share-sheet-toast share-sheet-toast-${toast.tone || 'info'}`}
        onClick={onDismiss}
      >
        {toast.message}
      </button>
    </div>
  );
}
