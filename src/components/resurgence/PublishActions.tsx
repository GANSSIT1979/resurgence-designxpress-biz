'use client';

export default function PublishActions({
  disabled = false,
  busy = false,
  busyMode = null,
  hasVideo = false,
  onSaveDraft,
  onSubmitForReview,
  helperText = 'Uploads go to Cloudflare Stream first, then the post record is written into Prisma.',
}: {
  disabled?: boolean;
  busy?: boolean;
  busyMode?: 'draft' | 'review' | null;
  hasVideo?: boolean;
  onSaveDraft: () => void;
  onSubmitForReview: () => void;
  helperText?: string;
}) {
  return (
    <div className="space-y-3 rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-white/85">Save actions</div>
          <p className="mt-1 text-xs leading-5 text-white/45">{helperText}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white/75">
          Creator review flow
        </span>
      </div>

      {!hasVideo ? (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          Upload a video first before saving the post.
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={disabled || busy || !hasVideo}
          onClick={onSaveDraft}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy && busyMode === 'draft' ? 'Saving draft...' : 'Save draft'}
        </button>

        <button
          type="button"
          disabled={disabled || busy || !hasVideo}
          onClick={onSubmitForReview}
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy && busyMode === 'review' ? 'Submitting...' : 'Submit for review'}
        </button>
      </div>
    </div>
  );
}
