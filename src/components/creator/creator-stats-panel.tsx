import { CreatorDisplayProfile, getCreatorStats } from '@/lib/creators';

export function CreatorStatsPanel({ creator }: { creator: CreatorDisplayProfile }) {
  const stats = getCreatorStats(creator);

  return (
    <article className="card creator-stats-panel">
      <div className="section-kicker">Stats Summary Card</div>
      <h2 style={{ marginTop: 0 }}>Reach and profile readiness</h2>
      <div className="card-grid grid-4">
        <div className="stat-card">
          <strong>{stats.linkedPlatformCount}</strong>
          <div className="helper">Social platforms linked</div>
        </div>
        <div className="stat-card">
          <strong>{stats.highestPlatform}</strong>
          <div className="helper">Highest follower platform</div>
        </div>
        <div className="stat-card">
          <strong>{stats.totalFollowersLabel}</strong>
          <div className="helper">Total visible followers</div>
        </div>
        <div className="stat-card">
          <strong>{stats.completeness}%</strong>
          <div className="helper">Profile completeness</div>
        </div>
      </div>
    </article>
  );
}
