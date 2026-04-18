'use client';

export function AdminPrintButton({ label = 'Print' }: { label?: string }) {
  return (
    <button className="btn btn-secondary" type="button" onClick={() => window.print()}>
      {label}
    </button>
  );
}
