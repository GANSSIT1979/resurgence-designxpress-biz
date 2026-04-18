import { CreatorDisplayProfile, displayCreatorValue, getCreatorBio } from '@/lib/creators';

export function CreatorBioSection({ creator }: { creator: CreatorDisplayProfile }) {
  return (
    <article className="card">
      <div className="section-kicker">Biography / Story Card</div>
      <h2 style={{ marginTop: 0 }}>Biography, career summary, and creator journey</h2>
      <div className="creator-story-grid">
        <div>
          <h3>Short Bio</h3>
          <p className="section-copy">{getCreatorBio(creator)}</p>
        </div>
        <div>
          <h3>Career Summary</h3>
          <p className="section-copy">{displayCreatorValue(creator.jobDescription || creator.platformFocus)}</p>
        </div>
        <div>
          <h3>Creator Journey</h3>
          <p className="section-copy">{displayCreatorValue(creator.journeyStory)}</p>
        </div>
        <div>
          <h3>Basketball Background</h3>
          <p className="section-copy">
            {displayCreatorValue(
              [creator.position, creator.height ? `${creator.height} height` : '', creator.audience]
                .filter(Boolean)
                .join(' - '),
            )}
          </p>
        </div>
      </div>
    </article>
  );
}
