'use client';

import { useMemo, useState } from 'react';
import CloudflareStreamEmbed from '@/components/resurgence/CloudflareStreamEmbed';

export type CloudflareUploadCompletePayload = {
  cloudflareVideoId: string;
  fileName: string;
  previewURL: string;
  thumbnailURL: string;
  customerCode: string;
  contentType: string;
  size: number;
};

type CloudflareDirectUploadFormProps = {
  creatorId: string;
  endpoint?: string;
  accept?: string;
  maxDurationSeconds?: number;
  requireSignedURLs?: boolean;
  className?: string;
  title?: string;
  description?: string;
  onUploadComplete?: (
    payload: CloudflareUploadCompletePayload,
  ) => void | Promise<void>;
};

type CreateUploadResponse = {
  success: boolean;
  uid?: string;
  uploadURL?: string;
  previewURL?: string;
  thumbnailURL?: string;
  customerCode?: string;
  error?: string;
  details?: unknown;
};

function formatProgress(value: number) {
  return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
}

export default function CloudflareDirectUploadForm({
  creatorId,
  endpoint = '/api/media/cloudflare/direct-upload',
  accept = 'video/mp4,video/quicktime,video/webm,video/*',
  maxDurationSeconds = 180,
  requireSignedURLs = false,
  className = '',
  title = 'Upload creator video',
  description = 'Send video directly to Cloudflare Stream, then save the returned video ID with your feed post.',
  onUploadComplete,
}: CloudflareDirectUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<CloudflareUploadCompletePayload | null>(
    null,
  );

  const isBusy = isPreparing || isUploading;

  const selectedLabel = useMemo(() => {
    if (!selectedFile) return 'No file selected yet.';
    const sizeMb = (selectedFile.size / 1024 / 1024).toFixed(2);
    return `${selectedFile.name} - ${sizeMb} MB`;
  }, [selectedFile]);

  async function createDirectUpload(file: File) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fileName: file.name,
        creatorId,
        maxDurationSeconds,
        requireSignedURLs,
        meta: {
          source: 'creator-feed-studio',
        },
      }),
    });

    const data = (await response.json()) as CreateUploadResponse;

    if (
      !response.ok ||
      !data.success ||
      !data.uid ||
      !data.uploadURL ||
      !data.previewURL ||
      !data.thumbnailURL ||
      !data.customerCode
    ) {
      throw new Error(data.error || 'Failed to create a Cloudflare upload URL.');
    }

    return data;
  }

  function uploadFileToCloudflare(uploadURL: string, file: File) {
    return new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', uploadURL);

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        setProgress((event.loaded / event.total) * 100);
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          setProgress(100);
          resolve();
          return;
        }

        reject(new Error(`Cloudflare upload failed with status ${xhr.status}.`));
      };

      xhr.onerror = () => {
        reject(new Error('Network error while uploading to Cloudflare Stream.'));
      };

      const formData = new FormData();
      formData.append('file', file);
      xhr.send(formData);
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setError('Choose a video file before starting the upload.');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      setProgress(0);
      setIsPreparing(true);

      const createRes = await createDirectUpload(selectedFile);

      setIsPreparing(false);
      setIsUploading(true);

      await uploadFileToCloudflare(createRes.uploadURL as string, selectedFile);

      const payload: CloudflareUploadCompletePayload = {
        cloudflareVideoId: createRes.uid as string,
        fileName: selectedFile.name,
        previewURL: createRes.previewURL as string,
        thumbnailURL: createRes.thumbnailURL as string,
        customerCode: createRes.customerCode as string,
        contentType: selectedFile.type || 'video/mp4',
        size: selectedFile.size,
      };

      setSuccess(payload);
      await onUploadComplete?.(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setIsPreparing(false);
      setIsUploading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`rounded-[28px] border border-white/10 bg-slate-950/90 p-5 text-white shadow-2xl shadow-black/20 ${className}`}
    >
      <div className="mb-5">
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-white/65">{description}</p>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-white/80">
            Video file
          </span>
          <input
            type="file"
            accept={accept}
            disabled={isBusy}
            onChange={(event) => {
              const file = event.target.files?.[0] || null;
              setSelectedFile(file);
              setError(null);
              setSuccess(null);
              setProgress(0);
            }}
            className="block w-full cursor-pointer rounded-2xl border border-dashed border-white/15 bg-white/5 px-4 py-3 text-sm text-white file:mr-4 file:rounded-xl file:border-0 file:bg-white file:px-4 file:py-2 file:text-sm file:font-medium file:text-slate-950 hover:border-white/25"
          />
        </label>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">
          <div className="flex items-center justify-between gap-3">
            <span>Selected file</span>
            <span className="text-right text-white/90">{selectedLabel}</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span>Creator ID</span>
            <span className="text-right text-white/90">{creatorId}</span>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <span>Protected playback</span>
            <span className="text-right text-white/90">
              {requireSignedURLs ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        {isPreparing || isUploading ? (
          <div className="rounded-2xl border border-fuchsia-500/20 bg-fuchsia-500/10 p-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-fuchsia-100">
                {isPreparing
                  ? 'Preparing secure upload URL...'
                  : 'Uploading to Cloudflare Stream...'}
              </span>
              <span className="text-fuchsia-100/80">{formatProgress(progress)}</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-white transition-all"
                style={{ width: `${Math.max(progress, isPreparing ? 12 : 0)}%` }}
              />
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="space-y-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-50">
            <div>
              <div className="font-medium">Upload complete</div>
              <div className="mt-1 break-all text-emerald-50/90">
                cloudflareVideoId:{' '}
                <span className="font-mono">{success.cloudflareVideoId}</span>
              </div>
            </div>

            <CloudflareStreamEmbed
              embedUrl={success.previewURL}
              title={success.fileName}
              vertical
              autoplay={false}
              muted
            />

            <div className="rounded-2xl border border-white/10 bg-black/20 p-3 font-mono text-xs text-white/85">
              Save this media record with storage provider{' '}
              <span className="font-semibold">cloudflare-stream</span> and ID{' '}
              <span className="font-semibold">{success.cloudflareVideoId}</span>.
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={isBusy || !selectedFile}
            className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBusy ? 'Uploading...' : 'Start upload'}
          </button>

          <button
            type="button"
            disabled={isBusy}
            onClick={() => {
              setSelectedFile(null);
              setProgress(0);
              setError(null);
              setSuccess(null);
            }}
            className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/15 px-5 py-3 text-sm font-medium text-white/85 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Reset
          </button>
        </div>
      </div>
    </form>
  );
}
