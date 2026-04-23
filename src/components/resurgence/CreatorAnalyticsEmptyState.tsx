export default function CreatorAnalyticsEmptyState({
  hasTopPosts = false,
}: {
  hasTopPosts?: boolean;
}) {
  return (
    <section className="rounded-[32px] border border-dashed border-white/15 bg-white/[0.03] p-8 text-center text-white shadow-2xl shadow-black/20">
      <div className="mx-auto max-w-xl space-y-3">
        <div className="text-xs uppercase tracking-[0.28em] text-white/45">Creator analytics</div>
        <h3 className="text-2xl font-semibold tracking-tight">No creator rollups yet</h3>
        <p className="text-sm text-white/60">
          Publish a few Cloudflare-backed feed posts and let the view and watch routes start writing into the analytics tables. This dashboard will switch from setup mode to live charts as soon as rollups are available.
        </p>
        {hasTopPosts ? (
          <p className="text-sm text-amber-200/85">
            Current leaderboard cards can still render below from live post counters while the daily series catches up.
          </p>
        ) : null}
      </div>
    </section>
  );
}
