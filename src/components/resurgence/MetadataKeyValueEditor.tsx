'use client';

type MetadataPair = {
  key: string;
  value: string;
};

export default function MetadataKeyValueEditor({
  value,
  onChange,
}: {
  value: MetadataPair[];
  onChange: (next: MetadataPair[]) => void;
}) {
  function updateAt(index: number, patch: Partial<MetadataPair>) {
    onChange(value.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  }

  function removeAt(index: number) {
    onChange(value.filter((_, itemIndex) => itemIndex !== index));
  }

  function appendRow() {
    onChange([...value, { key: '', value: '' }]);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-white/85">Extra metadata</h3>
          <p className="mt-1 text-xs leading-5 text-white/50">
            Use additive discovery or moderation fields here without changing the main composer.
          </p>
        </div>
        <button
          type="button"
          onClick={appendRow}
          className="inline-flex min-h-10 items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/80 transition hover:border-white/20 hover:text-white"
        >
          Add field
        </button>
      </div>

      <div className="space-y-2">
        {value.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white/45">
            No extra metadata fields added yet.
          </div>
        ) : null}

        {value.map((item, index) => (
          <div
            key={`${index}-${item.key}`}
            className="grid gap-2 rounded-[24px] border border-white/10 bg-white/[0.03] p-3 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)_auto]"
          >
            <input
              type="text"
              value={item.key}
              onChange={(event) => updateAt(index, { key: event.target.value })}
              placeholder="meta key"
              className="min-h-11 rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/55"
            />
            <input
              type="text"
              value={item.value}
              onChange={(event) => updateAt(index, { value: event.target.value })}
              placeholder="meta value"
              className="min-h-11 rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/55"
            />
            <button
              type="button"
              onClick={() => removeAt(index)}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm text-rose-100 transition hover:border-rose-300/30 hover:bg-rose-400/15"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
