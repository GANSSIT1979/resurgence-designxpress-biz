'use client';

import { useMemo, useState } from 'react';
import { CreatorCard } from '@/components/creator/creator-card';
import type { CreatorDisplayProfile } from '@/lib/creators';

export function CreatorDirectory({ creators }: { creators: CreatorDisplayProfile[] }) {
  const [query, setQuery] = useState('');

  const filteredCreators = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return creators;

    return creators.filter((creator) =>
      [
        creator.name,
        creator.position,
        creator.roleLabel,
        creator.jobDescription,
        creator.shortBio,
        creator.biography,
        creator.audience,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(normalized),
    );
  }, [creators, query]);

  return (
    <div className="creator-directory-panel">
      <div className="creator-directory-search card">
        <div>
          <div className="section-kicker">Searchable Creator Cards</div>
          <h2 style={{ marginTop: 0 }}>Find athletes, vloggers, and brand ambassadors</h2>
          <p className="helper">Search by creator name, position, job description, role, or audience focus.</p>
        </div>
        <input
          className="input"
          placeholder="Search creators..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="card-grid grid-3" style={{ marginTop: 24 }}>
        {filteredCreators.map((creator) => (
          <CreatorCard creator={creator} key={creator.id} />
        ))}
      </div>

      {!filteredCreators.length ? (
        <div className="empty-state" style={{ marginTop: 24 }}>
          No creators match that search yet. Try a name, position, or platform keyword.
        </div>
      ) : null}
    </div>
  );
}
