import type {
  CreatorAnalyticsApiResponse,
  CreatorAnalyticsExportPayload,
} from '@/lib/creator-analytics-api/types';

function formatDateLabel(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toISOString().slice(0, 10);
}

export function buildCreatorAnalyticsExport(
  payload: CreatorAnalyticsApiResponse,
): CreatorAnalyticsExportPayload {
  return {
    meta: {
      creatorId: payload.creatorId,
      range: payload.range,
      generatedAt: payload.generatedAt,
      dataMode: payload.dataMode,
      notice: payload.notice ?? null,
      rowCount: {
        daily: payload.series.length,
        posts: payload.topPosts.length,
      },
    },
    summary: payload.totals,
    dailyRows: payload.series.map((row) => ({
      ...row,
      dateLabel: formatDateLabel(row.date),
    })),
    postRows: payload.topPosts.map((row) => ({
      ...row,
      publishedDateLabel: row.publishedAt ? formatDateLabel(row.publishedAt) : null,
    })),
  };
}
