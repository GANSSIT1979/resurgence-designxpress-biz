'use client';

import type { CreatorPostsFilterValue } from '@/lib/creator-posts/types';

const tabs: CreatorPostsFilterValue[] = [
  'ALL',
  'PUBLISHED',
  'PENDING_REVIEW',
  'DRAFT',
  'ARCHIVED',
];

function tabLabel(tab: CreatorPostsFilterValue) {
  if (tab === 'ALL') return 'All posts';
  if (tab === 'PENDING_REVIEW') return 'In review';
  if (tab === 'ARCHIVED') return 'Archived';
  return tab.charAt(0) + tab.slice(1).toLowerCase();
}

export default function PostStatusTabs({
  value,
  counts,
  onChange,
}: {
  value: CreatorPostsFilterValue;
  counts: Record<CreatorPostsFilterValue, number>;
  onChange: (value: CreatorPostsFilterValue) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const active = value === tab;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={[
              'inline-flex min-h-10 items-center gap-2 rounded-full border px-4 py-2 text-sm transition',
              active
                ? 'border-white/20 bg-white text-slate-950'
                : 'border-white/10 bg-white/[0.04] text-white/75 hover:border-white/20 hover:text-white',
            ].join(' ')}
          >
            <span>{tabLabel(tab)}</span>
            <span className={active ? 'text-slate-700/80' : 'text-white/45'}>{counts[tab] || 0}</span>
          </button>
        );
      })}
    </div>
  );
}
