'use client';

type FilterChipItem = {
  value: string;
  label: string;
};

export function FilterChipRow({
  items,
  selected,
  onChange,
  multiple = false,
  className = '',
}: {
  items: FilterChipItem[];
  selected: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  className?: string;
}) {
  const selectedValues = Array.isArray(selected) ? selected : [selected];

  return (
    <div className={`filter-chip-row ${className}`.trim()}>
      {items.map((item) => {
        const isActive = selectedValues.includes(item.value);

        return (
          <button
            key={item.value}
            className={isActive ? 'filter-chip active' : 'filter-chip'}
            type="button"
            aria-pressed={isActive}
            onClick={() => {
              if (multiple) {
                const next = isActive
                  ? selectedValues.filter((value) => value !== item.value)
                  : [...selectedValues, item.value];
                onChange(next);
                return;
              }

              onChange(item.value);
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
