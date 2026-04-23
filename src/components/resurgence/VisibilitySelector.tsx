'use client';

type VisibilityValue = 'PUBLIC' | 'MEMBERS_ONLY' | 'PRIVATE';

const OPTIONS: Array<{
  value: VisibilityValue;
  label: string;
  description: string;
}> = [
  {
    value: 'PUBLIC',
    label: 'Public',
    description: 'Visible in the public feed and creator profile after approval or publish.',
  },
  {
    value: 'MEMBERS_ONLY',
    label: 'Members only',
    description: 'Visible only to signed-in members after the post is approved.',
  },
  {
    value: 'PRIVATE',
    label: 'Private',
    description: 'Saved for internal review, drafts, or private creator planning.',
  },
];

export default function VisibilitySelector({
  value,
  onChange,
  disabled = false,
}: {
  value: VisibilityValue;
  onChange: (value: VisibilityValue) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-3 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
      <div>
        <div className="text-sm font-medium text-white/85">Visibility</div>
        <p className="mt-1 text-xs leading-5 text-white/45">
          Choose where the video should appear once it clears the current publishing workflow.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {OPTIONS.map((option) => {
          const active = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(option.value)}
              className={`rounded-[22px] border p-4 text-left transition ${
                active
                  ? 'border-fuchsia-400/55 bg-fuchsia-500/12 text-white shadow-lg shadow-fuchsia-500/10'
                  : 'border-white/10 bg-black/20 text-white/75 hover:border-white/18 hover:bg-white/[0.05]'
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <div className="text-sm font-semibold">{option.label}</div>
              <p className="mt-2 text-xs leading-5 text-inherit/80">{option.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
