import Link from 'next/link';
import { formatCompactNumber, formatPercent, formatSeconds } from '@/lib/creator-analytics/format';
import type { TopPostRow } from '@/lib/creator-analytics/types';

export default function PostPerformanceLeaderboard({
  posts,
}: {
  posts: TopPostRow[];
}) {
  return (
    <section className="rounded-[32px] border border-white/10 bg-slate-950/88 p-5 text-white shadow-2xl shadow-black/20">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Top performing posts</h3>
          <p className="text-sm text-white/55">
            Leaderboard ranked by views with watch, completion, and interaction context.
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/45">
          Top 5
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.03] p-6 text-sm text-white/60">
          No published creator posts have enough live analytics yet to rank here.
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post, index) => (
            <article
              key={post.id}
              className="grid gap-3 rounded-[24px] border border-white/10 bg-black/30 p-4 md:grid-cols-[56px_minmax(0,88px)_minmax(0,1fr)_auto] md:items-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-amber-300 text-lg font-semibold text-slate-950">
                {index + 1}
              </div>
              <div className="overflow-hidden rounded-[20px] border border-white/10 bg-black/40">
                {post.thumbnailUrl ? (
                  <img
                    src={post.thumbnailUrl}
                    alt={post.title}
                    className="h-20 w-full object-cover"
                  />
                ) : (
                  <div className="flex h-20 items-center justify-center text-xs uppercase tracking-[0.18em] text-white/35">
                    No preview
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="truncate text-base font-medium text-white">{post.title}</div>
                <div className="mt-1 truncate text-sm text-white/55">
                  {post.caption || post.slug || 'Creator content post'}
                </div>
                <div className="mt-3 grid grid-cols-2 gap-x-5 gap-y-2 text-sm text-white/80 xl:grid-cols-4">
                  <div>
                    <div className="text-white/45">Views</div>
                    <div className="font-medium">{formatCompactNumber(post.metrics.views)}</div>
                  </div>
                  <div>
                    <div className="text-white/45">Watch</div>
                    <div className="font-medium">{formatSeconds(post.metrics.watchTimeSeconds)}</div>
                  </div>
                  <div>
                    <div className="text-white/45">Avg</div>
                    <div className="font-medium">{formatSeconds(post.metrics.avgWatchTimeSeconds)}</div>
                  </div>
                  <div>
                    <div className="text-white/45">Completion</div>
                    <div className="font-medium">{formatPercent(post.metrics.completionRate)}</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center md:justify-end">
                <Link
                  href={`/creator/posts/${encodeURIComponent(post.id)}`}
                  className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:border-white/20 hover:text-white"
                >
                  Open post
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
