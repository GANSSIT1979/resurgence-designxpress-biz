'use client';

import { useEffect } from 'react';
import type { BuiltSharePayload } from '@/lib/share/types';

function ActionButton({
  label,
  description,
  onClick,
  disabled,
  accent = false,
}: {
  label: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
  accent?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`share-sheet-action ${accent ? 'is-accent' : ''}`}
    >
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <span aria-hidden="true">{accent ? 'Open' : 'Go'}</span>
    </button>
  );
}

export function ShareSheetModal({
  open,
  busy = false,
  canNativeShare = false,
  payload,
  externalLinks,
  onClose,
  onNativeShare,
  onCopyLink,
  onOpenCreator,
  onOpenProduct,
  onOpenExternal,
}: {
  open: boolean;
  busy?: boolean;
  canNativeShare?: boolean;
  payload: BuiltSharePayload | null;
  externalLinks: {
    x: string;
    facebook: string;
    whatsapp: string;
  } | null;
  onClose: () => void;
  onNativeShare: () => Promise<void> | void;
  onCopyLink: () => Promise<void> | void;
  onOpenCreator: () => Promise<void> | void;
  onOpenProduct: () => Promise<void> | void;
  onOpenExternal: (url: string) => Promise<void> | void;
}) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, open]);

  if (!open || !payload) return null;

  return (
    <div className="share-sheet-overlay" role="dialog" aria-modal="true" aria-label="Share post">
      <button
        type="button"
        className="share-sheet-backdrop"
        aria-label="Close share sheet"
        onClick={onClose}
      />

      <aside className="share-sheet-panel">
        <div className="share-sheet-handle" aria-hidden="true" />

        <div className="share-sheet-header">
          <div>
            <div className="section-kicker">Share</div>
            <h3>Share this post</h3>
            <p>Copy the feed link, use native sharing, or jump directly to the creator and tagged merch.</p>
          </div>

          <button type="button" className="share-sheet-close" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="share-sheet-preview">
          <strong>{payload.title}</strong>
          <p>{payload.text}</p>
          <span>{payload.url}</span>
        </div>

        <div className="share-sheet-actions">
          <ActionButton
            label="Native share"
            description={canNativeShare ? 'Use the device share sheet.' : 'This device does not support native sharing.'}
            onClick={() => void onNativeShare()}
            disabled={busy || !canNativeShare}
          />
          <ActionButton
            label="Copy link"
            description="Copy the feed deep link to your clipboard."
            onClick={() => void onCopyLink()}
            disabled={busy}
          />
          <ActionButton
            label="Open creator profile"
            description="Jump to the creator channel tied to this post."
            onClick={() => void onOpenCreator()}
            disabled={busy || !payload.creatorUrl}
            accent
          />
          <ActionButton
            label="Open tagged product"
            description="Go directly to the linked merch or product page."
            onClick={() => void onOpenProduct()}
            disabled={busy || !payload.productUrl}
            accent
          />
        </div>

        {externalLinks ? (
          <div className="share-sheet-external">
            <div className="section-kicker">External Share</div>
            <div className="share-sheet-external-grid">
              <button type="button" onClick={() => void onOpenExternal(externalLinks.whatsapp)} disabled={busy}>
                WhatsApp
              </button>
              <button type="button" onClick={() => void onOpenExternal(externalLinks.facebook)} disabled={busy}>
                Facebook
              </button>
              <button type="button" onClick={() => void onOpenExternal(externalLinks.x)} disabled={busy}>
                X
              </button>
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
