import { CreatorDirectory } from '@/components/creator/creator-directory';
import { getCreators } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function CreatorsPage() {
  const creators = await getCreators();

  return (
    <main>
      <section className="hero creator-directory-hero">
        <div className="container">
          <span className="badge">Creator Channels</span>
          <h1 className="hero-title">Resurgence creator channels, built for sports culture and sponsor trust.</h1>
          <p className="hero-copy">
            Browse basketball players, influencers, vloggers, brand ambassadors, and sponsor-ready creators with channel-style profiles, social reach, highlights, and direct paths into merch and partnership workflows.
          </p>
          <div className="btn-row" style={{ marginTop: 20 }}>
            <a className="button-link" href="/feed">Open Discover Feed</a>
            <a className="button-link btn-secondary" href="/shop">Shop Creator-Linked Merch</a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <CreatorDirectory creators={creators} />
        </div>
      </section>
    </main>
  );
}
