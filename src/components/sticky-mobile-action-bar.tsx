'use client';

import Link from 'next/link';

export function StickyMobileActionBar({
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  note,
}: {
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
  note?: string;
}) {
  return (
    <div className="sticky-mobile-action-bar">
      {note ? <div className="sticky-mobile-action-bar-note">{note}</div> : null}
      <div className="sticky-mobile-action-bar-actions">
        {secondaryLabel && secondaryHref ? (
          <Link className="button-link btn-secondary" href={secondaryHref}>
            {secondaryLabel}
          </Link>
        ) : null}
        <Link className="button-link" href={primaryHref}>
          {primaryLabel}
        </Link>
      </div>
    </div>
  );
}
