import { CreatorDisplayProfile, displayCreatorValue, getCreatorSocialLinks } from '@/lib/creators';

export function CreatorSocialLinks({
  creator,
  title = 'Social Media Presence',
  compact = false,
}: {
  creator: CreatorDisplayProfile;
  title?: string;
  compact?: boolean;
}) {
  const socials = getCreatorSocialLinks(creator);

  return (
    <article className={compact ? 'creator-social-list compact' : 'creator-social-list card'}>
      {!compact ? (
        <>
          <div className="section-kicker">Social Media Card</div>
          <h2 style={{ marginTop: 0 }}>{title}</h2>
        </>
      ) : null}

      <div className="creator-social-grid">
        {socials.map((social) => (
          <div className="creator-social-row" key={social.key}>
            <div>
              <strong>{social.label}</strong>
              <div className="helper">{displayCreatorValue(social.followers)}</div>
            </div>
            {social.url ? (
              <a className="button-link btn-secondary creator-social-button" href={social.url} target="_blank" rel="noopener noreferrer">
                {social.linkLabel}
              </a>
            ) : (
              <span className="helper">{social.emptyLabel}</span>
            )}
          </div>
        ))}
      </div>
    </article>
  );
}
