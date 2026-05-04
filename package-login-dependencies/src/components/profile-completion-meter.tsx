'use client';

import Link from 'next/link';

export function ProfileCompletionMeter({
  title = 'Profile completion',
  percent,
  missingItems = [],
  ctaHref,
  ctaLabel = 'Complete profile',
}: {
  title?: string;
  percent: number;
  missingItems?: string[];
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const safePercent = Math.max(0, Math.min(100, Math.round(percent)));

  return (
    <section className="profile-completion-meter">
      <div className="profile-completion-meter-head">
        <div>
          <div className="section-kicker">Onboarding Prompt</div>
          <h3>{title}</h3>
        </div>
        <strong>{safePercent}%</strong>
      </div>

      <div
        className="profile-completion-meter-track"
        aria-label={`${safePercent}% complete`}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={safePercent}
      >
        <span style={{ width: `${safePercent}%` }} />
      </div>

      {missingItems.length ? (
        <div className="profile-completion-meter-missing">
          {missingItems.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      ) : (
        <p className="helper">Everything needed for this step is in place.</p>
      )}

      {ctaHref ? (
        <div className="profile-completion-meter-actions">
          <Link className="button-link btn-secondary" href={ctaHref}>
            {ctaLabel}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
