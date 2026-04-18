import { CreatorDirectory } from '@/components/creator/creator-directory';
import { getCreators } from '@/lib/site';

export const dynamic = 'force-dynamic';

export default async function CreatorsPage() {
  const creators = await getCreators();

  return (
    <main>
      <section className="hero creator-directory-hero">
        <div className="container">
          <span className="badge">Creators</span>
          <h1 className="hero-title">Resurgence Powered by DesignXpress creator network.</h1>
          <p className="hero-copy">
            Browse basketball players, influencers, vloggers, brand ambassadors, and sponsor-ready creators with clickable social profiles and complete public dashboards.
          </p>
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
