import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

type ObsLog = {
  id: string;
  level?: string | null;
  event?: string | null;
  requestId?: string | null;
  route?: string | null;
  method?: string | null;
  status?: number | null;
  durationMs?: number | null;
  provider?: string | null;
  resourceType?: string | null;
  resourceId?: string | null;
  createdAt?: Date | string | null;
};

type ObsMetric = {
  id: string;
  name?: string | null;
  value?: number | string | null;
  tagsJson?: any;
  createdAt?: Date | string | null;
};

type ObsAlert = {
  id: string;
  severity?: string | null;
  title?: string | null;
  message?: string | null;
  provider?: string | null;
  resourceType?: string | null;
  resourceId?: string | null;
  createdAt?: Date | string | null;
};

type ChartPoint = { label: string; value: number };

function hasUsableDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL || '';
  return Boolean(databaseUrl && !databaseUrl.includes('@HOST:') && !databaseUrl.includes('HOST:6543'));
}

function date(value: unknown) {
  return value ? new Date(value as string).toLocaleString('en-PH') : '-';
}

function dayLabel(value: unknown) {
  if (!value) return 'Unknown';
  return new Date(value as string).toLocaleDateString('en-PH', { month: 'short', day: '2-digit' });
}

function groupMetricsByDay(metrics: ObsMetric[], name: string): ChartPoint[] {
  const map = new Map<string, number>();
  metrics
    .filter((metric) => metric.name === name)
    .forEach((metric) => {
      const label = dayLabel(metric.createdAt);
      map.set(label, (map.get(label) || 0) + Number(metric.value || 0));
    });
  return Array.from(map.entries()).reverse().slice(-14).map(([label, value]) => ({ label, value }));
}

function countByLabel(values: string[]): ChartPoint[] {
  const map = new Map<string, number>();
  values.forEach((value) => map.set(value || 'unknown', (map.get(value || 'unknown') || 0) + 1));
  return Array.from(map.entries()).map(([label, value]) => ({ label, value }));
}

async function getObservabilityData() {
  if (!hasUsableDatabaseUrl()) {
    return { logs: [] as ObsLog[], metrics: [] as ObsMetric[], alerts: [] as ObsAlert[], error: 'Database is not configured.' };
  }

  try {
    const logDelegate = (prisma as any).observabilityLog;
    const metricDelegate = (prisma as any).observabilityMetric;
    const alertDelegate = (prisma as any).observabilityAlert;

    const [logs, metrics, alerts] = await Promise.all([
      logDelegate?.findMany ? logDelegate.findMany({ orderBy: { createdAt: 'desc' }, take: 75 }) : Promise.resolve([]),
      metricDelegate?.findMany ? metricDelegate.findMany({ orderBy: { createdAt: 'desc' }, take: 250 }) : Promise.resolve([]),
      alertDelegate?.findMany ? alertDelegate.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }) : Promise.resolve([]),
    ]);

    const missing = !logDelegate?.findMany || !metricDelegate?.findMany || !alertDelegate?.findMany;

    return {
      logs: logs as ObsLog[],
      metrics: metrics as ObsMetric[],
      alerts: alerts as ObsAlert[],
      error: missing ? 'Observability tables are not available yet. Add Prisma models, run db:push, and regenerate Prisma.' : null,
    };
  } catch (error) {
    console.error('[admin-observability] load failed', error);
    return {
      logs: [] as ObsLog[],
      metrics: [] as ObsMetric[],
      alerts: [] as ObsAlert[],
      error: 'Unable to load observability data. Check Prisma schema and database tables.',
    };
  }
}

export default async function AdminObservabilityPage() {
  const { logs, metrics, alerts, error } = await getObservabilityData();

  const errorLogs = logs.filter((log) => log.level === 'error').length;
  const warnLogs = logs.filter((log) => log.level === 'warn').length;
  const criticalAlerts = alerts.filter((alert) => alert.severity === 'critical').length;
  const revenue = metrics
    .filter((metric) => metric.name === 'revenue.recorded')
    .reduce((sum, metric) => sum + Number(metric.value || 0), 0);
  const funnelSteps = metrics.filter((metric) => String(metric.name || '').startsWith('funnel.')).length;
  const conversions = metrics.filter((metric) => String(metric.name || '').startsWith('conversion.')).length;

  const revenueTrend = groupMetricsByDay(metrics, 'revenue.recorded');
  const severityBreakdown = countByLabel(logs.map((log) => log.level || 'info'));
  const funnelBreakdown = countByLabel(metrics.filter((metric) => String(metric.name || '').startsWith('funnel.')).map((metric) => String(metric.name || '').replace('funnel.', '')));
  const conversionBreakdown = countByLabel(metrics.filter((metric) => String(metric.name || '').startsWith('conversion.')).map((metric) => String(metric.name || '').replace('conversion.', '')));
  const latencyByRoute = logs
    .filter((log) => log.route && log.durationMs != null)
    .slice(0, 50)
    .reduce((map, log) => {
      const key = String(log.route);
      const existing = map.get(key) || { total: 0, count: 0 };
      map.set(key, { total: existing.total + Number(log.durationMs || 0), count: existing.count + 1 });
      return map;
    }, new Map<string, { total: number; count: number }>());
  const latencyChart = Array.from(latencyByRoute.entries())
    .map(([label, value]) => ({ label, value: Math.round(value.total / Math.max(value.count, 1)) }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return (
    <main style={{ padding: 24, maxWidth: 1280, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <div>
          <p style={{ margin: 0, color: '#666', textTransform: 'uppercase', letterSpacing: 2, fontSize: 12 }}>Admin / Observability</p>
          <h1 style={{ margin: '6px 0 0', fontSize: 36 }}>Observability Dashboard</h1>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/admin/revenue" style={{ fontWeight: 700 }}>Revenue</Link>
          <Link href="/admin/invoices" style={{ fontWeight: 700 }}>Invoices</Link>
          <Link href="/admin" style={{ fontWeight: 700 }}>Admin</Link>
        </div>
      </div>

      {error ? (
        <div style={{ border: '1px solid #f5c2c7', background: '#fff5f5', color: '#842029', padding: 16, borderRadius: 12, marginBottom: 20 }}>
          {error}
        </div>
      ) : null}

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 16, marginBottom: 24 }}>
        <Metric label="Logs" value={logs.length} />
        <Metric label="Errors" value={errorLogs} />
        <Metric label="Warnings" value={warnLogs} />
        <Metric label="Critical Alerts" value={criticalAlerts} />
        <Metric label="Revenue Metrics" value={`PHP ${revenue.toLocaleString('en-PH')}`} />
        <Metric label="Funnel + Conversions" value={funnelSteps + conversions} />
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 18, marginBottom: 18 }}>
        <Panel title="Revenue Trend">
          <BarChart data={revenueTrend} emptyLabel="No revenue metrics yet." valuePrefix="PHP " />
        </Panel>
        <Panel title="Log Severity Distribution">
          <BarChart data={severityBreakdown} emptyLabel="No logs yet." />
        </Panel>
        <Panel title="Sponsor / Payment Funnel">
          <BarChart data={funnelBreakdown} emptyLabel="No funnel metrics yet." />
        </Panel>
        <Panel title="Conversion Events">
          <BarChart data={conversionBreakdown} emptyLabel="No conversion metrics yet." />
        </Panel>
        <Panel title="Slowest Routes Avg Latency">
          <BarChart data={latencyChart} emptyLabel="No latency data yet." valueSuffix=" ms" />
        </Panel>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 18 }}>
        <Panel title="Recent Alerts">
          {alerts.length ? alerts.slice(0, 12).map((alert) => (
            <div key={alert.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
              <strong>{alert.title || 'Alert'}</strong>
              <div>{alert.message || '-'}</div>
              <small style={{ color: '#666' }}>{alert.severity || 'info'} · {alert.provider || 'internal'} · {date(alert.createdAt)}</small>
            </div>
          )) : <p style={{ color: '#666' }}>No persisted alerts yet.</p>}
        </Panel>

        <Panel title="Recent Metrics">
          {metrics.length ? metrics.slice(0, 14).map((metric) => (
            <div key={metric.id} style={{ borderBottom: '1px solid #eee', padding: '10px 0' }}>
              <strong>{metric.name || 'metric'}</strong>
              <div>Value: {metric.value == null ? '-' : String(metric.value)}</div>
              <small style={{ color: '#666' }}>{date(metric.createdAt)}</small>
            </div>
          )) : <p style={{ color: '#666' }}>No persisted metrics yet.</p>}
        </Panel>
      </section>

      <section style={{ marginTop: 18 }}>
        <Panel title="Recent API Logs">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                  <th style={{ padding: 8 }}>Time</th>
                  <th style={{ padding: 8 }}>Level</th>
                  <th style={{ padding: 8 }}>Event</th>
                  <th style={{ padding: 8 }}>Route</th>
                  <th style={{ padding: 8 }}>Status</th>
                  <th style={{ padding: 8 }}>ms</th>
                  <th style={{ padding: 8 }}>Request ID</th>
                </tr>
              </thead>
              <tbody>
                {logs.length ? logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f1f1f1' }}>
                    <td style={{ padding: 8 }}>{date(log.createdAt)}</td>
                    <td style={{ padding: 8 }}>{log.level || 'info'}</td>
                    <td style={{ padding: 8 }}>{log.event || '-'}</td>
                    <td style={{ padding: 8 }}>{log.route || '-'}</td>
                    <td style={{ padding: 8 }}>{log.status ?? '-'}</td>
                    <td style={{ padding: 8 }}>{log.durationMs ?? '-'}</td>
                    <td style={{ padding: 8, fontFamily: 'monospace' }}>{log.requestId || '-'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={7} style={{ padding: 12, color: '#666' }}>No persisted logs yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 18 }}>
      <p style={{ margin: 0, color: '#666' }}>{label}</p>
      <strong style={{ fontSize: 26 }}>{value}</strong>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 18 }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      {children}
    </section>
  );
}

function BarChart({ data, emptyLabel, valuePrefix = '', valueSuffix = '' }: { data: ChartPoint[]; emptyLabel: string; valuePrefix?: string; valueSuffix?: string }) {
  const max = Math.max(...data.map((item) => item.value), 0);
  if (!data.length || max <= 0) return <p style={{ color: '#666' }}>{emptyLabel}</p>;

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {data.map((item) => {
        const width = `${Math.max(4, Math.round((item.value / max) * 100))}%`;
        return (
          <div key={item.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, fontSize: 13 }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
              <strong>{valuePrefix}{item.value.toLocaleString('en-PH')}{valueSuffix}</strong>
            </div>
            <div style={{ height: 12, background: '#f3f4f6', borderRadius: 999, marginTop: 4, overflow: 'hidden' }}>
              <div style={{ width, height: '100%', background: '#111827', borderRadius: 999 }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
