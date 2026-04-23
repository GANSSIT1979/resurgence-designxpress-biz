import { CreatorDisplayProfile, displayCreatorValue, getCreatorPrimaryRole, getCreatorStats, getCreatorStatus } from '@/lib/creators';

export function CreatorProfileHeader({ creator }: { creator: CreatorDisplayProfile }) {
  const stats = getCreatorStats(creator);

  return (
    <section className="creator-profile-hero">
      <div className="container creator-profile-hero-grid">
        <div className="creator-profile-copy">
          <div className="btn-row">
            <span className="badge">Creator Dashboard</span>
            <span className={`status-chip ${creator.isActive ? 'tone-success' : 'tone-danger'}`}>{getCreatorStatus(creator)}</span>
            <span className="status-chip tone-info">Creator Role</span>
          </div>
          <h1 className="hero-title">{creator.name}</h1>
          <p className="hero-copy">{displayCreatorValue(creator.jobDescription || creator.platformFocus)}</p>
          <div className="creator-header-facts">
            <div>
              <span>Job Description</span>
              <strong>{displayCreatorValue(creator.jobDescription)}</strong>
            </div>
            <div>
              <span>Position</span>
              <strong>{getCreatorPrimaryRole(creator)}</strong>
            </div>
            <div>
              <span>Height</span>
              <strong>{displayCreatorValue(creator.height)}</strong>
            </div>
          </div>
          <div className="creator-header-facts creator-channel-facts">
            <div>
              <span>Total visible reach</span>
              <strong>{stats.totalFollowersLabel}</strong>
            </div>
            <div>
              <span>Linked platforms</span>
              <strong>{stats.linkedPlatformCount}</strong>
            </div>
            <div>
              <span>Profile readiness</span>
              <strong>{stats.completeness}%</strong>
            </div>
          </div>
        </div>

        <div className="creator-profile-photo-card">
          <img src={creator.imageUrl || '/assets/resurgence-poster.jpg'} alt={creator.name} />
          <div className="creator-profile-photo-caption">
            <div className="section-kicker">Resurgence Powered by DesignXpress</div>
            <h2>{displayCreatorValue(creator.position || creator.roleLabel)}</h2>
          </div>
        </div>
      </div>
    </section>
  );
}
