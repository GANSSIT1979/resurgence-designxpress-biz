import type { CreatorPostStatus } from '@/lib/creator-posts/types';

const styles: Record<CreatorPostStatus, string> = {
  DRAFT: 'border-amber-400/20 bg-amber-400/10 text-amber-100',
  PENDING_REVIEW: 'border-sky-400/20 bg-sky-400/10 text-sky-100',
  PUBLISHED: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-50',
  ARCHIVED: 'border-slate-400/20 bg-slate-400/10 text-slate-100',
};

function statusLabel(status: CreatorPostStatus) {
  if (status === 'PENDING_REVIEW') return 'IN REVIEW';
  return status;
}

export default function PostStatusChip({ status }: { status: CreatorPostStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-wide ${styles[status]}`}>
      {statusLabel(status)}
    </span>
  );
}
