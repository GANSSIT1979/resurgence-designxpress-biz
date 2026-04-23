'use client';

type Toast = {
  id: string;
  tone: 'success' | 'error' | 'info';
  message: string;
};

export function CommentsToastViewport({ toasts }: { toasts: Toast[] }) {
  if (!toasts.length) return null;

  return (
    <div className="comments-toast-viewport" aria-live="polite">
      {toasts.map((toast) => (
        <div key={toast.id} className={`comments-toast comments-toast-${toast.tone}`} role="status">
          {toast.message}
        </div>
      ))}
    </div>
  );
}
