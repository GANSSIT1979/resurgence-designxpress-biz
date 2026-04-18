import { CreatorAdminActions } from '@/components/creator/creator-admin-actions';
import { CreatorBioSection } from '@/components/creator/creator-bio-section';
import { CreatorProfileHeader } from '@/components/creator/creator-profile-header';
import { CreatorSocialLinks } from '@/components/creator/creator-social-links';
import { CreatorStatsPanel } from '@/components/creator/creator-stats-panel';
import {
  CreatorDisplayProfile,
  displayCreatorValue,
  formatCreatorDate,
  formatCreatorShortDate,
  getEmbeddableVideoUrl,
} from '@/lib/creators';

export function CreatorProfileDashboard({
  creator,
  showAdminActions = false,
}: {
  creator: CreatorDisplayProfile;
  showAdminActions?: boolean;
}) {
  const trendingVideo = getEmbeddableVideoUrl(creator.trendingVideoUrl);

  return (
    <>
      <CreatorProfileHeader creator={creator} />

      <section className="section">
        <div className="container card-grid grid-2">
          <article className="card">
            <div className="section-kicker">Personal Information Card</div>
            <h2 style={{ marginTop: 0 }}>Creator details</h2>
            <div className="creator-detail-list">
              <div><span>Contact Number</span><strong>{displayCreatorValue(creator.contactNumber)}</strong></div>
              <div><span>Address</span><strong>{displayCreatorValue(creator.address)}</strong></div>
              <div><span>Date of Birth</span><strong>{formatCreatorDate(creator.dateOfBirth)}</strong></div>
              <div><span>Created At</span><strong>{formatCreatorShortDate(creator.createdAt)}</strong></div>
              <div><span>Updated At</span><strong>{formatCreatorShortDate(creator.updatedAt)}</strong></div>
            </div>
          </article>

          <CreatorSocialLinks creator={creator} />
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container card-grid grid-2">
          <article className="card">
            <div className="section-kicker">Trending Content Card</div>
            <h2 style={{ marginTop: 0 }}>Featured creator video</h2>
            {trendingVideo?.embedUrl ? (
              <div className="creator-video-frame">
                <iframe
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  src={trendingVideo.embedUrl}
                  title={`${creator.name} trending video`}
                />
              </div>
            ) : (
              <div className="empty-state">Video preview is not embeddable here.</div>
            )}
            <div className="btn-row" style={{ marginTop: 18 }}>
              {trendingVideo?.url ? (
                <a className="button-link" href={trendingVideo.url} target="_blank" rel="noopener noreferrer">
                  Watch Trending Video
                </a>
              ) : (
                <span className="helper">No link available</span>
              )}
            </div>
          </article>

          <CreatorStatsPanel creator={creator} />
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <CreatorBioSection creator={creator} />
        </div>
      </section>

      {showAdminActions ? (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <CreatorAdminActions creator={creator} />
          </div>
        </section>
      ) : null}
    </>
  );
}
