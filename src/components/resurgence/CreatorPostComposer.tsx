'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import CloudflareDirectUploadForm, {
  type CloudflareUploadCompletePayload,
} from '@/components/resurgence/CloudflareDirectUploadForm';
import CloudflareStreamEmbed from '@/components/resurgence/CloudflareStreamEmbed';
import HashtagInput from '@/components/resurgence/HashtagInput';
import PublishActions from '@/components/resurgence/PublishActions';
import VisibilitySelector from '@/components/resurgence/VisibilitySelector';
import {
  getCloudflareStreamCustomerCode,
  getCloudflareStreamVideoId,
  isCloudflareStreamAsset,
} from '@/lib/cloudflare-stream';
import { mapContentPostToFeedItem } from '@/lib/feed/mapContentPostToFeedItem';
import type { FeedPost } from '@/lib/feed/types';

type VisibilityValue = 'PUBLIC' | 'MEMBERS_ONLY' | 'PRIVATE';
type SaveMode = 'DRAFT' | 'PENDING_REVIEW';

type SaveResponse = {
  ok?: boolean;
  item?: FeedPost;
  feedPreview?: Record<string, unknown> | null;
  error?: string;
};

function compactNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

function isFeedPost(value: unknown): value is FeedPost {
  return Boolean(
    value &&
      typeof value === 'object' &&
      typeof (value as FeedPost).id === 'string' &&
      Array.isArray((value as FeedPost).mediaAssets),
  );
}

function hashtagsToFeedTags(hashtags: string[]) {
  return hashtags.map((tag, index) => ({
    id: `preview-tag-${index}-${tag}`,
    label: `#${tag.replace(/^#+/g, '')}`,
    normalizedName: tag.replace(/^#+/g, '').toLowerCase(),
  }));
}

function deriveInitialUpload(post?: FeedPost | null): CloudflareUploadCompletePayload | null {
  const media = post?.mediaAssets[0];
  if (!media || !isCloudflareStreamAsset(media)) return null;

  const cloudflareVideoId = getCloudflareStreamVideoId(media);
  if (!cloudflareVideoId) return null;

  return {
    cloudflareVideoId,
    fileName: media.originalFileName || `${post?.slug || post?.id || 'creator-post'}.mp4`,
    previewURL: media.url,
    thumbnailURL: media.thumbnailUrl || '',
    customerCode: getCloudflareStreamCustomerCode(media),
    contentType: media.contentType || 'video/mp4',
    size: media.size || 0,
  };
}

export default function CreatorPostComposer({
  creatorId,
  creatorDisplayName,
  creatorSlug,
  creatorAvatar = null,
  creatorRoleLabel = 'Creator',
  saveEndpoint = '/api/creator/posts/create',
  uploadEndpoint = '/api/media/cloudflare/direct-upload',
  redirectPath = '/creator/posts',
  publicProfileHref,
  initialPost = null,
}: {
  creatorId: string;
  creatorDisplayName: string;
  creatorSlug: string;
  creatorAvatar?: string | null;
  creatorRoleLabel?: string;
  saveEndpoint?: string;
  uploadEndpoint?: string;
  redirectPath?: string;
  publicProfileHref?: string;
  initialPost?: FeedPost | null;
}) {
  const router = useRouter();
  const isEditing = Boolean(initialPost?.id);
  const [title, setTitle] = useState(initialPost?.title || '');
  const [caption, setCaption] = useState(initialPost?.caption || '');
  const [hashtags, setHashtags] = useState<string[]>(
    initialPost?.hashtags.map((tag) => tag.label.replace(/^#/, '')) || [],
  );
  const [visibility, setVisibility] = useState<VisibilityValue>(
    (initialPost?.visibility as VisibilityValue) || 'PUBLIC',
  );
  const [busyMode, setBusyMode] = useState<'draft' | 'review' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [upload, setUpload] = useState<CloudflareUploadCompletePayload | null>(() => deriveInitialUpload(initialPost));
  const [savedPreview, setSavedPreview] = useState<FeedPost | null>(initialPost);

  const livePreviewItem = useMemo(() => {
    if (savedPreview) {
      return {
        ...savedPreview,
        title: title || null,
        caption: caption || savedPreview.caption,
        visibility,
        hashtags: hashtagsToFeedTags(hashtags),
      };
    }

    if (!upload?.cloudflareVideoId) return null;

    return mapContentPostToFeedItem(
      {
        id: upload.cloudflareVideoId,
        creatorId,
        caption: caption || title || 'Your creator video preview is ready.',
        title,
        visibility,
        status: 'DRAFT',
        mediaType: 'VIDEO',
        cloudflareVideoId: upload.cloudflareVideoId,
        customerCode: upload.customerCode,
        previewURL: upload.previewURL,
        thumbnailUrl: upload.thumbnailURL,
        hashtags,
      },
      {
        creator: {
          id: creatorId,
          name: creatorDisplayName,
          slug: creatorSlug,
          roleLabel: creatorRoleLabel,
          imageUrl: creatorAvatar,
        },
      },
    );
  }, [
    caption,
    creatorAvatar,
    creatorDisplayName,
    creatorId,
    creatorRoleLabel,
    creatorSlug,
    hashtags,
    savedPreview,
    title,
    upload,
    visibility,
  ]);

  async function savePost(mode: SaveMode) {
    const hasExistingMedia = Boolean(initialPost?.mediaAssets[0]);
    if (!upload?.cloudflareVideoId && !hasExistingMedia) {
      setError('Upload a Cloudflare Stream video before saving the post.');
      return;
    }

    setBusyMode(mode === 'DRAFT' ? 'draft' : 'review');
    setError(null);
    setSuccessMessage(null);

    try {
      let response: Response;

      if (isEditing && initialPost) {
        const fallbackMedia = initialPost.mediaAssets[0];
        const mediaAssets =
          upload?.cloudflareVideoId
            ? [
                {
                  mediaType: 'VIDEO',
                  url: upload.previewURL,
                  thumbnailUrl: upload.thumbnailURL,
                  originalFileName: upload.fileName,
                  storageProvider: 'cloudflare-stream',
                  storageKey: upload.cloudflareVideoId,
                  contentType: upload.contentType,
                  size: upload.size,
                  durationSeconds: null,
                  metadata: {
                    cloudflareVideoId: upload.cloudflareVideoId,
                    customerCode: upload.customerCode,
                    originalFileName: upload.fileName,
                    uploadSource: 'cloudflare-direct-upload',
                  },
                  altText: caption.trim() || title.trim(),
                  caption: title.trim(),
                  sortOrder: 0,
                },
              ]
            : fallbackMedia
              ? [
                  {
                    mediaType: fallbackMedia.mediaType,
                    url: fallbackMedia.url,
                    thumbnailUrl: fallbackMedia.thumbnailUrl || '',
                    originalFileName: fallbackMedia.originalFileName || '',
                    storageProvider: fallbackMedia.storageProvider || '',
                    storageKey: fallbackMedia.storageKey || '',
                    contentType: fallbackMedia.contentType || '',
                    size: fallbackMedia.size ?? null,
                    durationSeconds: fallbackMedia.durationSeconds ?? null,
                    metadata: fallbackMedia.metadata || undefined,
                    altText: caption.trim() || fallbackMedia.altText || '',
                    caption: title.trim() || fallbackMedia.caption || '',
                    sortOrder: fallbackMedia.sortOrder,
                  },
                ]
              : [];

        response = await fetch(`/api/feed/${initialPost.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: title.trim() || undefined,
            caption: caption.trim() || initialPost.caption,
            summary: initialPost.summary || undefined,
            slug: initialPost.slug || undefined,
            visibility,
            status: mode,
            mediaAssets,
            hashtags,
            productIds: initialPost.productTags.map((tag) => tag.productId).filter(Boolean),
            meta: initialPost.meta || undefined,
          }),
        });
      } else {
        response = await fetch(saveEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            creatorId,
            cloudflareVideoId: upload?.cloudflareVideoId,
            originalFileName: upload?.fileName,
            title: title.trim() || undefined,
            caption: caption.trim() || undefined,
            hashtags,
            visibility,
            status: mode,
            thumbnailUrl: upload?.thumbnailURL,
            meta: {
              source: 'creator-studio-phase1',
              uploadEndpoint,
              customerCode: upload?.customerCode,
            },
          }),
        });
      }

      const data = (await response.json().catch(() => null)) as SaveResponse | null;
      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || 'Failed to save the creator post.');
      }

      const nextPreview = isFeedPost(data.item)
        ? data.item
        : mapContentPostToFeedItem(
            {
              ...(data.feedPreview || {}),
              id: initialPost?.id || upload?.cloudflareVideoId || 'creator-post',
              creatorId,
              title,
              caption,
              visibility,
              cloudflareVideoId: upload?.cloudflareVideoId,
              customerCode: upload?.customerCode,
              previewURL: upload?.previewURL,
              thumbnailUrl: upload?.thumbnailURL,
              hashtags,
            },
            {
              creator: {
                id: creatorId,
                name: creatorDisplayName,
                slug: creatorSlug,
                roleLabel: creatorRoleLabel,
                imageUrl: creatorAvatar,
              },
            },
          );

      setSavedPreview(nextPreview);
      setSuccessMessage(
        nextPreview.status === 'PUBLISHED'
          ? 'Post published successfully.'
          : nextPreview.status === 'PENDING_REVIEW'
            ? isEditing
              ? 'Post updated and submitted for review.'
              : 'Post submitted for review.'
            : isEditing
              ? 'Draft updated successfully.'
              : 'Draft saved successfully.',
      );
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unexpected error while saving the post.');
    } finally {
      setBusyMode(null);
    }
  }

  const previewMedia = livePreviewItem?.mediaAssets[0] ?? null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_420px] xl:grid-cols-[minmax(0,1.15fr)_460px]">
      <section className="space-y-5 rounded-[32px] border border-white/10 bg-slate-950/88 p-5 shadow-2xl shadow-black/20 md:p-6">
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-[0.28em] text-fuchsia-200/75">Creator studio</div>
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            {isEditing ? 'Edit creator post' : 'Publish your next vertical post'}
          </h2>
          <p className="max-w-3xl text-sm leading-6 text-white/65">
            {isEditing
              ? 'Update caption, hashtags, visibility, or replace the Cloudflare video while keeping the post inside the current Prisma-backed creator workflow.'
              : 'Upload to Cloudflare Stream, add caption and hashtags, then save the post into Prisma so it can flow into the creator feed stack without relying on local disk uploads.'}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
            <div className="text-xs uppercase tracking-[0.18em] text-white/45">Creator</div>
            <div className="mt-2 text-lg font-semibold text-white">{creatorDisplayName}</div>
            <div className="mt-1 text-sm text-white/55">@{creatorSlug}</div>
          </div>

          <label className="block rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
            <span className="mb-2 block text-sm font-medium text-white/80">Post title</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Optional headline for your creator post"
              maxLength={180}
              className="block min-h-11 w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/55"
            />
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white/80">Caption</span>
          <textarea
            value={caption}
            onChange={(event) => setCaption(event.target.value)}
            rows={5}
            maxLength={2200}
            placeholder="Write a short, punchy caption that feels native to a vertical creator feed."
            className="block w-full rounded-[24px] border border-white/12 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/55"
          />
          <div className="mt-2 text-right text-xs text-white/40">{caption.length}/2200</div>
        </label>

        <HashtagInput value={hashtags} onChange={setHashtags} />
        <VisibilitySelector value={visibility} onChange={setVisibility} />

        <CloudflareDirectUploadForm
          creatorId={creatorId}
          endpoint={uploadEndpoint}
          title={isEditing ? 'Replace vertical video' : 'Upload vertical video'}
          description={
            isEditing
              ? 'Upload a replacement clip to Cloudflare Stream if this post needs a new video asset. You can also keep the current media and just update the metadata.'
              : 'Upload the clip directly to Cloudflare Stream. Once the upload finishes, this composer will save the returned video ID into the current Prisma-backed feed model.'
          }
          onUploadComplete={async (payload) => {
            setUpload(payload);
            setSavedPreview(null);
            setSuccessMessage(
              isEditing
                ? 'Replacement video upload complete. Review the preview, then save the draft or resubmit for review.'
                : 'Video upload complete. Review the preview, then save a draft or submit for review.',
            );
            setError(null);
          }}
        />

        {error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        {successMessage ? (
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-50">
            {successMessage}
          </div>
        ) : null}

        <PublishActions
          busy={Boolean(busyMode)}
          busyMode={busyMode}
          disabled={!upload?.cloudflareVideoId && !initialPost?.mediaAssets[0]}
          hasVideo={Boolean(upload?.cloudflareVideoId || initialPost?.mediaAssets[0])}
          onSaveDraft={() => savePost('DRAFT')}
          onSubmitForReview={() => savePost('PENDING_REVIEW')}
          helperText={
            isEditing
              ? 'Update the current draft or resubmit the edited post into the current creator review workflow.'
              : 'Creators save drafts locally in Prisma, then submit posts into the current review-safe feed workflow.'
          }
        />

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href={redirectPath}
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-4 py-2.5 text-white/80 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            Go to creator posts
          </Link>
          {publicProfileHref ? (
            <Link
              href={publicProfileHref}
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/12 bg-transparent px-4 py-2.5 text-white/70 transition hover:border-white/20 hover:text-white"
            >
              Open public profile
            </Link>
          ) : null}
        </div>
      </section>

      <aside className="space-y-5">
        <section className="overflow-hidden rounded-[32px] border border-white/10 bg-slate-950/88 p-4 shadow-2xl shadow-black/20 md:p-5">
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-white/45">Live preview</div>
            <h3 className="mt-2 text-xl font-semibold text-white">Feed-style creator post preview</h3>
            <p className="mt-2 text-sm leading-6 text-white/60">
              This preview uses the current feed item shape and Cloudflare playback rules already active in the app.
            </p>
          </div>

          <div className="mt-4 overflow-hidden rounded-[30px] border border-white/10 bg-black">
            {livePreviewItem && previewMedia ? (
              <div className="relative min-h-[720px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_38%),linear-gradient(180deg,#020617,#111827)]">
                <div className="absolute inset-0">
                  {isCloudflareStreamAsset(previewMedia) ? (
                    <CloudflareStreamEmbed
                      embedUrl={previewMedia.url}
                      title={livePreviewItem.title || livePreviewItem.caption}
                      vertical
                      autoplay={false}
                      muted
                      className="h-full rounded-none"
                    />
                  ) : previewMedia.thumbnailUrl ? (
                    <img
                      src={previewMedia.thumbnailUrl}
                      alt={previewMedia.altText || livePreviewItem.caption}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-6 text-center text-sm text-white/55">
                      Video preview is ready after the Cloudflare upload finishes.
                    </div>
                  )}
                </div>

                <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/85" />

                <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-3 text-xs text-white/80">
                  <span className="rounded-full border border-white/12 bg-black/35 px-3 py-1 uppercase tracking-[0.18em]">
                    {livePreviewItem.status.replace(/_/g, ' ')}
                  </span>
                  <span className="rounded-full border border-white/12 bg-black/35 px-3 py-1 uppercase tracking-[0.18em]">
                    {livePreviewItem.visibility.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="absolute bottom-0 left-0 right-0 flex gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <img
                        src={livePreviewItem.creator?.imageUrl || '/assets/resurgence-logo.jpg'}
                        alt={livePreviewItem.creator?.name || creatorDisplayName}
                        className="h-11 w-11 rounded-full border border-white/15 object-cover"
                      />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-white">
                          {livePreviewItem.creator?.name || creatorDisplayName}
                        </div>
                        <div className="truncate text-xs text-white/70">
                          @{livePreviewItem.creator?.slug || creatorSlug} | {livePreviewItem.creator?.roleLabel || creatorRoleLabel}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {livePreviewItem.title ? (
                        <div className="text-base font-semibold leading-6 text-white">
                          {livePreviewItem.title}
                        </div>
                      ) : null}
                      <p className="text-sm leading-6 text-white/88">{livePreviewItem.caption}</p>

                      {livePreviewItem.hashtags.length ? (
                        <div className="flex flex-wrap gap-2">
                          {livePreviewItem.hashtags.map((tag) => (
                            <span
                              key={tag.id}
                              className="rounded-full border border-white/12 bg-black/35 px-3 py-1 text-xs text-white/80"
                            >
                              {tag.label}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex w-[78px] flex-col items-center gap-3 self-end pb-1 text-center text-[11px] text-white/82">
                    <div className="space-y-1">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/35">
                        <span>Like</span>
                      </div>
                      <div>{compactNumber(livePreviewItem.metrics.likes)}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/35">
                        <span>Talk</span>
                      </div>
                      <div>{compactNumber(livePreviewItem.metrics.comments)}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/35">
                        <span>Save</span>
                      </div>
                      <div>{compactNumber(livePreviewItem.metrics.saves)}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/35">
                        <span>Share</span>
                      </div>
                      <div>{compactNumber(livePreviewItem.metrics.shares)}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[720px] items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_45%),linear-gradient(180deg,#020617,#111827)] px-6 text-center text-sm text-white/50">
                Upload a video to generate the live creator feed preview.
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-slate-950/88 p-5 shadow-2xl shadow-black/20">
          <div className="text-xs uppercase tracking-[0.24em] text-white/45">Workflow notes</div>
          <div className="mt-4 space-y-3 text-sm leading-6 text-white/65">
            <p>
              This composer uses the signed-in creator session and linked creator profile. The manual creator ID field from the starter pack is not exposed here.
            </p>
            <p>
              Uploads go to <code className="rounded bg-white/10 px-1.5 py-0.5 text-white">Cloudflare Stream</code>, while save and update calls write through the current Prisma-backed feed routes.
            </p>
            <p>
              Creator submissions follow the current permission model, so the primary action is <strong>Submit for review</strong> instead of bypassing moderation and publishing directly.
            </p>
          </div>
        </section>
      </aside>
    </div>
  );
}
