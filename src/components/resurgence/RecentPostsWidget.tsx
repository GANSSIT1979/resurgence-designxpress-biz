import Link from 'next/link';
import PostStatusChip from '@/components/resurgence/PostStatusChip';
import type { CreatorPostsManagerItem } from '@/lib/creator-posts/types';
import { formatCompactNumber, formatDateLabel } from '@/lib/creator-posts/utils';

export default function RecentPostsWidget({
  posts,
  title = 'Recent creator posts',
  href = '/creator/posts',
}: {
  posts: CreatorPostsManagerItem[];
  title?: string;
  href?: string;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-slate-950/88 p-5 shadow-2xl shadow-black/20">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
          <p className="mt-1 text-sm text-white/65">
            Monitor the latest drafts, review items, and published posts from your creator studio.
          </p>
        </div>
        <Link href={href} className="text-sm font-medium text-white/80 transition hover:text-white">
          View all
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {posts.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/65">
            No creator posts yet.
          </div>
        ) : (
          posts.slice(0, 4).map((post) => (
            <div key={post.id} className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <PostStatusChip status={post.status} />
                  <span className="text-xs text-white/45">{formatDateLabel(post.updatedAt || post.createdAt)}</span>
                </div>
                <div className="mt-2 truncate text-sm font-medium text-white">{post.title || post.caption || 'Untitled creator post'}</div>
                <div className="mt-1 text-xs text-white/55">
                  {formatCompactNumber(post.viewsCount)} views | {formatCompactNumber(post.likesCount)} likes
                </div>
              </div>
              <Link
                href={`/creator/posts/${encodeURIComponent(post.id)}`}
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/80 transition hover:border-white/20 hover:text-white"
              >
                Open
              </Link>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
