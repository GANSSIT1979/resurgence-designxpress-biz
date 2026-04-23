'use client';

import { useMemo, useState } from 'react';

function sanitizeTag(raw: string) {
  return raw
    .trim()
    .replace(/^#+/g, '')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 32);
}

export default function HashtagInput({
  value,
  onChange,
  maxItems = 8,
  label = 'Hashtags',
  helperText = 'Press Enter, comma, or space to add a hashtag.',
  disabled = false,
}: {
  value: string[];
  onChange: (hashtags: string[]) => void;
  maxItems?: number;
  label?: string;
  helperText?: string;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState('');
  const remaining = useMemo(() => Math.max(0, maxItems - value.length), [maxItems, value.length]);

  function commitTag(raw: string) {
    const tag = sanitizeTag(raw);
    if (!tag || value.includes(tag) || value.length >= maxItems) {
      setDraft('');
      return;
    }

    onChange([...value, tag]);
    setDraft('');
  }

  function removeTag(tag: string) {
    onChange(value.filter((item) => item !== tag));
  }

  return (
    <div className="space-y-3 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-white/85">{label}</label>
        <span className="text-xs text-white/45">{remaining} slots left</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {value.length > 0 ? (
          value.map((tag) => (
            <button
              key={tag}
              type="button"
              disabled={disabled}
              onClick={() => removeTag(tag)}
              className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-3 py-1.5 text-sm text-white transition hover:border-white/20 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>#{tag}</span>
              <span aria-hidden="true" className="text-white/55">x</span>
            </button>
          ))
        ) : (
          <div className="rounded-full border border-dashed border-white/10 px-3 py-1.5 text-sm text-white/45">
            No hashtags added yet.
          </div>
        )}
      </div>

      <input
        type="text"
        value={draft}
        disabled={disabled || value.length >= maxItems}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ',' || event.key === ' ') {
            event.preventDefault();
            commitTag(draft);
          }

          if (event.key === 'Backspace' && !draft && value.length > 0) {
            removeTag(value[value.length - 1]);
          }
        }}
        onBlur={() => commitTag(draft)}
        placeholder="Add topic tags like game-day, creator-pick, drop"
        className="block min-h-11 w-full rounded-2xl border border-white/12 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/55"
      />

      <p className="text-xs leading-5 text-white/45">{helperText}</p>
    </div>
  );
}
