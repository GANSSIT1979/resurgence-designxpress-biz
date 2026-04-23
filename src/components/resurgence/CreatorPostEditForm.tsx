'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import HashtagInput from '@/components/resurgence/HashtagInput';
import MetadataKeyValueEditor from '@/components/resurgence/MetadataKeyValueEditor';
import VisibilitySelector from '@/components/resurgence/VisibilitySelector';
import { updateCreatorPost } from '@/lib/creator-posts/edit-client';
import type {
  CreatorPostEditableRecord,
  CreatorPostEditVisibility,
} from '@/lib/creator-posts/edit-types';

type MetadataPair = {
  key: string;
  value: string;
};

function metaObjectToPairs(meta?: Record<string, unknown> | null): MetadataPair[] {
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) return [];

  return Object.entries(meta)
    .filter(([key]) =>
      !['source', 'uploadEndpoint', 'cloudflareVideoId', 'customerCode', 'duplicatedFromPostId'].includes(key),
    )
    .map(([key, value]) => ({
      key,
      value: typeof value === 'string' ? value : JSON.stringify(value),
    }));
}

function pairsToMeta(pairs: MetadataPair[]) {
  return Object.fromEntries(
    pairs
      .map((item) => [item.key.trim(), item.value.trim()] as const)
      .filter(([key, value]) => key.length > 0 && value.length > 0),
  );
}

export default function CreatorPostEditForm({
  post,
  onPostUpdated,
}: {
  post: CreatorPostEditableRecord;
  onPostUpdated?: (post: CreatorPostEditableRecord) => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(post.title || '');
  const [caption, setCaption] = useState(post.caption || '');
  const [hashtags, setHashtags] = useState<string[]>(post.hashtags || []);
  const [visibility, setVisibility] = useState<CreatorPostEditVisibility>(post.visibility);
  const [posterUrl, setPosterUrl] = useState(post.posterUrl || '');
  const [thumbnailUrl, setThumbnailUrl] = useState(post.thumbnailUrl || '');
  const [originalFileName, setOriginalFileName] = useState(post.originalFileName || '');
  const [durationSeconds, setDurationSeconds] = useState(
    post.durationSeconds != null ? String(post.durationSeconds) : '',
  );
  const [aspectRatio, setAspectRatio] = useState(post.aspectRatio || '9:16');
  const [altText, setAltText] = useState(post.altText || '');
  const [locationLabel, setLocationLabel] = useState(post.locationLabel || '');
  const [languageCode, setLanguageCode] = useState(post.languageCode || '');
  const [metaPairs, setMetaPairs] = useState<MetadataPair[]>(metaObjectToPairs(post.meta));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setTitle(post.title || '');
    setCaption(post.caption || '');
    setHashtags(post.hashtags || []);
    setVisibility(post.visibility);
    setPosterUrl(post.posterUrl || '');
    setThumbnailUrl(post.thumbnailUrl || '');
    setOriginalFileName(post.originalFileName || '');
    setDurationSeconds(post.durationSeconds != null ? String(post.durationSeconds) : '');
    setAspectRatio(post.aspectRatio || '9:16');
    setAltText(post.altText || '');
    setLocationLabel(post.locationLabel || '');
    setLanguageCode(post.languageCode || '');
    setMetaPairs(metaObjectToPairs(post.meta));
  }, [post]);

  const helperLine = useMemo(() => {
    const segments = [
      post.mediaType ? `Media: ${post.mediaType}` : null,
      post.cloudflareVideoId ? 'Cloudflare video attached' : null,
      post.status ? `Status: ${post.status}` : null,
    ].filter(Boolean);
    return segments.join(' | ');
  }, [post.cloudflareVideoId, post.mediaType, post.status]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!caption.trim()) {
      setError('Caption cannot be empty.');
      return;
    }

    try {
      setIsSaving(true);

      const meta = pairsToMeta(metaPairs);
      const data = await updateCreatorPost(post.id, {
        title: title.trim() || null,
        caption: caption.trim() || null,
        hashtags,
        visibility,
        posterUrl: posterUrl.trim() || null,
        thumbnailUrl: thumbnailUrl.trim() || null,
        originalFileName: originalFileName.trim() || null,
        durationSeconds: durationSeconds.trim() ? Number(durationSeconds) : null,
        aspectRatio: aspectRatio.trim() || null,
        altText: altText.trim() || null,
        locationLabel: locationLabel.trim() || null,
        languageCode: languageCode.trim() || null,
        meta,
      });

      if (!data.post) {
        throw new Error('The update route did not return a refreshed post payload.');
      }

      onPostUpdated?.(data.post);
      setSuccess('Creator post updated successfully.');
      router.refresh();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : 'Unexpected error while updating the creator post.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-[32px] border border-white/10 bg-slate-950/88 p-5 shadow-2xl shadow-black/20 md:p-6"
    >
      <div>
        <div className="text-xs uppercase tracking-[0.24em] text-fuchsia-200/70">Edit workspace</div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Edit creator post</h2>
        <p className="mt-2 text-sm leading-6 text-white/65">
          Refine caption, hashtags, visibility, and media metadata without breaking the current Cloudflare + Prisma pipeline.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/55">
        {helperLine || 'Creator post edit mode'}
      </div>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white/80">Title</span>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={180}
          placeholder="Optional headline for this post"
          className="block min-h-11 w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/55"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-medium text-white/80">Caption</span>
        <textarea
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          rows={6}
          maxLength={2200}
          placeholder="Edit the feed-facing caption and call to action."
          className="block w-full rounded-[24px] border border-white/12 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/55"
        />
        <div className="mt-2 text-right text-xs text-white/40">{caption.length}/2200</div>
      </label>

      <HashtagInput
        value={hashtags}
        onChange={setHashtags}
        maxItems={12}
        helperText="Press Enter, comma, or space to add creator-topic hashtags."
      />

      <VisibilitySelector value={visibility} onChange={setVisibility} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white/80">Poster URL</span>
          <input
            type="url"
            value={posterUrl}
            onChange={(event) => setPosterUrl(event.target.value)}
            placeholder="https://..."
            className="block min-h-11 w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/55"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white/80">Thumbnail URL</span>
          <input
            type="url"
            value={thumbnailUrl}
            onChange={(event) => setThumbnailUrl(event.target.value)}
            placeholder="https://..."
            className="block min-h-11 w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/55"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white/80">Original file name</span>
          <input
            type="text"
            value={originalFileName}
            onChange={(event) => setOriginalFileName(event.target.value)}
            placeholder="gameday-fit-check.mp4"
            className="block min-h-11 w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/55"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white/80">Duration (seconds)</span>
          <input
            type="number"
            min="0"
            step="1"
            value={durationSeconds}
            onChange={(event) => setDurationSeconds(event.target.value)}
            placeholder="15"
            className="block min-h-11 w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/55"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white/80">Aspect ratio</span>
          <input
            type="text"
            value={aspectRatio}
            onChange={(event) => setAspectRatio(event.target.value)}
            placeholder="9:16"
            className="block min-h-11 w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/55"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white/80">Language code</span>
          <input
            type="text"
            value={languageCode}
            onChange={(event) => setLanguageCode(event.target.value)}
            placeholder="en"
            className="block min-h-11 w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/55"
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white/80">Alt text</span>
          <textarea
            value={altText}
            onChange={(event) => setAltText(event.target.value)}
            rows={3}
            placeholder="Describe the clip for accessibility and search quality."
            className="block w-full rounded-[24px] border border-white/12 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/55"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white/80">Location label</span>
          <textarea
            value={locationLabel}
            onChange={(event) => setLocationLabel(event.target.value)}
            rows={3}
            placeholder="Optional event, city, or location label"
            className="block w-full rounded-[24px] border border-white/12 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/35 focus:border-fuchsia-400/55"
          />
        </label>
      </div>

      <MetadataKeyValueEditor value={metaPairs} onChange={setMetaPairs} />

      {error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-50">
          {success}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-fuchsia-400/25 bg-fuchsia-400/10 px-5 py-2.5 text-sm font-medium text-fuchsia-50 transition hover:border-fuchsia-300/35 hover:bg-fuchsia-400/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? 'Saving changes...' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/creator/posts/new?edit=${encodeURIComponent(post.id)}`)}
          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-4 py-2.5 text-sm text-white/80 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
        >
          Open full composer
        </button>
        <button
          type="button"
          onClick={() => router.push('/creator/posts')}
          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/12 bg-transparent px-4 py-2.5 text-sm text-white/70 transition hover:border-white/20 hover:text-white"
        >
          Back to creator posts
        </button>
      </div>
    </form>
  );
}
