import Link from 'next/link';

export function KpiStatCard({
  label,
  value,
  delta,
  icon,
  helper,
  href,
}: {
  label: string;
  value: string | number;
  delta?: string;
  icon?: string;
  helper?: string;
  href?: string;
}) {
  const content = (
    <article className="kpi-stat-card">
      <div className="kpi-stat-card-top">
        <span>{label}</span>
        {icon ? <strong className="kpi-stat-card-icon">{icon}</strong> : null}
      </div>
      <div className="kpi-stat-card-value">{value}</div>
      {delta || helper ? (
        <div className="kpi-stat-card-meta">
          {delta ? <strong>{delta}</strong> : null}
          {helper ? <span>{helper}</span> : null}
        </div>
      ) : null}
    </article>
  );

  if (!href) return content;

  return (
    <Link className="kpi-stat-card-link" href={href}>
      {content}
    </Link>
  );
}
