export function formatCompactNumber(value: number | null | undefined) {
  const safe = Number(value || 0);
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(safe);
}

export function formatPercent(value: number | null | undefined) {
  const safe = Number(value || 0);
  return `${safe.toFixed(1)}%`;
}

export function formatSeconds(seconds: number | null | undefined) {
  const safe = Math.max(0, Math.round(Number(seconds || 0)));

  if (safe < 60) return `${safe}s`;

  const minutes = Math.floor(safe / 60);
  const remainder = safe % 60;
  if (minutes < 60) return `${minutes}m ${remainder}s`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

export function formatDateLabel(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString('en-PH', {
    month: 'short',
    day: 'numeric',
  });
}

export function formatDelta(deltaPct?: number) {
  if (typeof deltaPct !== 'number' || !Number.isFinite(deltaPct)) {
    return 'No comparison yet';
  }

  const sign = deltaPct > 0 ? '+' : '';
  return `${sign}${deltaPct.toFixed(1)}% vs prior period`;
}
