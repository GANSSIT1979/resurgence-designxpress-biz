'use client';

import type { AnalyticsRangeKey } from '@/lib/creator-analytics/types';

export default function AnalyticsDateRangeTabs({
  value,
  onChange,
}: {
  value: AnalyticsRangeKey;
  onChange: (next: AnalyticsRangeKey) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1 text-sm text-white/75 shadow-lg shadow-black/20">
      {([
        ['7d', 'Last 7 days'],
        ['30d', 'Last 30 days'],
      ] as const).map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={`rounded-full px-4 py-2 transition ${
            value === key
              ? 'bg-amber-300 text-slate-950 shadow-md shadow-amber-400/20'
              : 'hover:bg-white/10 hover:text-white'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
