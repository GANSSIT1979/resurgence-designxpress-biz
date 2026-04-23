import Link from 'next/link';
import { CreatorDisplayProfile, displayCreatorValue, getCreatorStats, getLinkedCreatorSocials } from '@/lib/creators';

export function CreatorCard({ creator }: { creator: CreatorDisplayProfile }) {
  const linkedSocials = getLinkedCreatorSocials(creator);
  const stats = getCreatorStats(creator);

  return (
    <article className="card creator-card">
      <img src={creator.imageUrl || '/assets/resurgence-logo.jpg'} alt={creator.name} />
      <div className="creator-card-body">
        <div className="btn-row">
          <span className={`status-chip ${creator.isActive ? 'tone-success' : 'tone-danger'}`}>
            {creator.isActive ? 'Active' : 'Inactive'}
          </span>
          <span className="status-chip tone-info">Creator</span>
        </div>
        <h3>{creator.name}</h3>
        <div className="helper">{displayCreatorValue(creator.position || creator.roleLabel)}</div>
        <p className="section-copy">{displayCreatorValue(creator.jobDescription || creator.shortBio || creator.biography)}</p>
        <div className="creator-card-kpis">
          <div>
            <strong>{stats.totalFollowersLabel}</strong>
            <span>Visible reach</span>
          </div>
          <div>
            <strong>{stats.linkedPlatformCount}</strong>
            <span>Platforms linked</span>
          </div>
          <div>
            <strong>{stats.completeness}%</strong>
            <span>Profile ready</span>
          </div>
        </div>
        <div className="creator-card-socials">
          {linkedSocials.map((social) => (
            <a key={social.key} href={social.url} target="_blank" rel="noopener noreferrer" aria-label={social.linkLabel}>
              {social.label}
            </a>
          ))}
          {!linkedSocials.length ? <span className="helper">No social links available</span> : null}
        </div>
        <Link href={`/creators/${creator.slug}`} className="button-link">
          View Full Profile
        </Link>
      </div>
    </article>
  );
}
