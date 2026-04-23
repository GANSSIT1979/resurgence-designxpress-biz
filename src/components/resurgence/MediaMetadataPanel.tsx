'use client';

import CloudflareStreamEmbed from '@/components/resurgence/CloudflareStreamEmbed';
import type { CreatorPostEditableRecord } from '@/lib/creator-posts/edit-types';
import { formatDateLabel } from '@/lib/creator-posts/utils';

function Detail({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="text-[11px] uppercase tracking-[0.18em] text-white/40">{label}</div>
      <div className="mt-1 text-sm text-white/85">{value || 'Not set'}</div>
    </div>
  );
}

export default function MediaMetadataPanel({
  post,
}: {
  post: CreatorPostEditableRecord;
}) {
  const cover = post.posterUrl || post.thumbnailUrl || null;

  return (
    <section className="space-y-4 rounded-[32px] border border-white/10 bg-slate-950/88 p-5 shadow-2xl shadow-black/20">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-white">Media preview</h2>
        <p className="mt-1 text-sm leading-6 text-white/60">
          Keep the short-form playback context visible while you refine caption, visibility, and media metadata.
        </p>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-black">
        {post.mediaType === 'cloudflare-stream' && post.mediaUrl ? (
          <CloudflareStreamEmbed
            embedUrl={post.mediaUrl}
            title={post.title || 'Creator post preview'}
            vertical
            autoplay={false}
            muted
            className="rounded-none"
          />
        ) : cover ? (
          <img
            src={cover}
            alt={post.altText || post.title || 'Creator post preview'}
            className="h-full min-h-[520px] w-full object-cover"
          />
        ) : (
          <div className="flex min-h-[520px] items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_45%),linear-gradient(180deg,#020617,#111827)] px-6 text-center text-sm text-white/50">
            No media preview is available for this post yet.
          </div>
        )}
      </div>

      <div className="space-y-3 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
        <div className="text-xs uppercase tracking-[0.18em] text-white/40">Feed context</div>
        <div className="text-lg font-semibold text-white">{post.title || 'Untitled creator post'}</div>
        <p className="text-sm leading-6 text-white/72">{post.caption || 'No caption saved yet.'}</p>
        {post.hashtags?.length ? (
          <div className="flex flex-wrap gap-2">
            {post.hashtags.map((tag) => (
              <span
                key={`${post.id}-${tag}`}
                className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/75"
              >
                #{tag.replace(/^#+/g, '')}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        <Detail label="Media type" value={post.mediaType || 'none'} />
        <Detail label="Visibility" value={post.visibility} />
        <Detail label="Status" value={post.status || 'DRAFT'} />
        <Detail label="Duration" value={post.durationSeconds ?? 'Not set'} />
        <Detail label="Aspect ratio" value={post.aspectRatio || 'Not set'} />
        <Detail label="Cloudflare video" value={post.cloudflareVideoId || 'Not attached'} />
        <Detail label="Language" value={post.languageCode || 'Not set'} />
        <Detail label="Location" value={post.locationLabel || 'Not set'} />
        <Detail label="Updated" value={formatDateLabel(post.updatedAt)} />
      </div>
    </section>
  );
}
