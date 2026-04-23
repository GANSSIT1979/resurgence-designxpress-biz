import CloudflareStreamEmbed from '@/components/resurgence/CloudflareStreamEmbed';
import PostQuickActions from '@/components/resurgence/PostQuickActions';
import PostStatusChip from '@/components/resurgence/PostStatusChip';
import type { CreatorPostsManagerItem } from '@/lib/creator-posts/types';
import { formatCompactNumber, formatDateLabel } from '@/lib/creator-posts/utils';

function Metric({ label, value }: { label: string; value?: number | null }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">{label}</div>
      <div className="mt-1 text-sm font-medium text-white">{formatCompactNumber(value)}</div>
    </div>
  );
}

export default function CreatorPostCard({
  post,
  pendingAction,
  onEdit,
  onDelete,
  onPublish,
  onUnpublish,
  onDuplicate,
}: {
  post: CreatorPostsManagerItem;
  pendingAction?: string | null;
  onEdit?: (post: CreatorPostsManagerItem) => void;
  onDelete?: (post: CreatorPostsManagerItem) => void;
  onPublish?: (post: CreatorPostsManagerItem) => void;
  onUnpublish?: (post: CreatorPostsManagerItem) => void;
  onDuplicate?: (post: CreatorPostsManagerItem) => void;
}) {
  const caption = post.caption || post.title || 'No caption added yet.';
  const cover = post.posterUrl || post.thumbnailUrl || null;

  return (
    <article className="grid gap-4 rounded-[28px] border border-white/10 bg-slate-950/88 p-4 shadow-2xl shadow-black/20 lg:grid-cols-[230px_minmax(0,1fr)]">
      <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black">
        {post.mediaType === 'cloudflare-stream' && post.mediaUrl ? (
          <CloudflareStreamEmbed
            embedUrl={post.mediaUrl}
            title={post.title || 'Creator post'}
            vertical
            autoplay={false}
            muted
            className="h-full rounded-none"
          />
        ) : cover ? (
          <img src={cover} alt={post.title || 'Post cover'} className="h-full min-h-[380px] w-full object-cover" />
        ) : (
          <div className="flex min-h-[380px] items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.1),transparent_40%),linear-gradient(180deg,#020617,#0f172a)] text-sm text-white/55">
            Preview unavailable
          </div>
        )}
      </div>

      <div className="flex min-h-full flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <PostStatusChip status={post.status} />
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/65">
                {post.visibility.replace(/_/g, ' ')}
              </span>
            </div>
            <h3 className="mt-3 text-xl font-semibold tracking-tight text-white">{post.title || 'Untitled creator post'}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/72">{caption}</p>
          </div>

          <div className="text-right text-xs text-white/45">
            <div>Updated {formatDateLabel(post.updatedAt || post.createdAt)}</div>
            {post.publishedAt ? <div className="mt-1">Published {formatDateLabel(post.publishedAt)}</div> : null}
          </div>
        </div>

        {post.hashtags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {post.hashtags.map((tag) => (
              <span key={`${post.id}-${tag}`} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/75">
                #{tag.replace(/^#+/g, '')}
              </span>
            ))}
          </div>
        ) : null}

        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="Views" value={post.viewsCount} />
          <Metric label="Likes" value={post.likesCount} />
          <Metric label="Comments" value={post.commentsCount} />
          <Metric label="Shares" value={post.sharesCount} />
          <Metric label="Saves" value={post.savesCount} />
        </div>

        <div className="mt-auto">
          <PostQuickActions
            post={post}
            pendingAction={pendingAction}
            onEdit={onEdit}
            onDelete={onDelete}
            onPublish={onPublish}
            onUnpublish={onUnpublish}
            onDuplicate={onDuplicate}
          />
        </div>
      </div>
    </article>
  );
}
