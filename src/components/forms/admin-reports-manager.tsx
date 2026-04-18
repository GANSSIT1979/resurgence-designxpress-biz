'use client';

import { useMemo, useState } from 'react';
import { MetricBarChart } from '@/components/metric-bar-chart';

type SnapshotMetric = { label: string; value: string | number };
type ChartGroup = { title: string; items: { label: string; value: number; helper?: string }[] };

type SavedReport = {
  id: string;
  title: string;
  reportType: string;
  summary: string | null;
  payloadJson: string;
  generatedByEmail: string | null;
  createdAt: string;
};

export function AdminReportsManager({
  liveTitle,
  liveSummary,
  liveMetrics,
  chartGroups,
  initialReports,
}: {
  liveTitle: string;
  liveSummary: string;
  liveMetrics: SnapshotMetric[];
  chartGroups: ChartGroup[];
  initialReports: SavedReport[];
}) {
  const [reports, setReports] = useState(initialReports);
  const [title, setTitle] = useState(`${liveTitle} Snapshot`);
  const [summary, setSummary] = useState(liveSummary);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const payloadJson = useMemo(() => JSON.stringify({ liveTitle, liveSummary, generatedAt: new Date().toISOString(), metrics: liveMetrics }, null, 2), [liveMetrics, liveSummary, liveTitle]);

  async function saveSnapshot() {
    setNotice(null);
    setError(null);

    const response = await fetch('/api/admin/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, summary, payloadJson, reportType: 'SYSTEM_ADMIN' }),
    });

    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to save report snapshot.');
      return;
    }

    setReports((current) => [data.item, ...current]);
    setNotice('Report snapshot saved successfully.');
  }

  async function deleteReport(id: string) {
    setNotice(null);
    setError(null);

    const response = await fetch(`/api/admin/reports/${id}`, { method: 'DELETE' });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error || 'Unable to delete report.');
      return;
    }

    setReports((current) => current.filter((item) => item.id !== id));
    setNotice('Saved report deleted.');
  }

  function printCurrent() {
    window.print();
  }

  function exportCurrent() {
    const csv = ['Metric,Value', ...liveMetrics.map((item) => `${escapeCsv(item.label)},${escapeCsv(String(item.value))}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resurgence-admin-report-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportCurrentJson() {
    const blob = new Blob([payloadJson], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resurgence-admin-report-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="card-grid grid-2">
      <section className="card">
        <div className="section-kicker">Live Report Builder</div>
        <h2 style={{ marginTop: 0 }}>{liveTitle}</h2>
        <p className="section-copy">{liveSummary}</p>

        {notice ? <div className="notice success" style={{ marginTop: 18 }}>{notice}</div> : null}
        {error ? <div className="notice error" style={{ marginTop: 18 }}>{error}</div> : null}

        <div className="card-grid grid-3" style={{ marginTop: 18 }}>
          {liveMetrics.map((item) => (
            <div className="panel" key={item.label}>
              <strong>{item.value}</strong>
              <div className="helper">{item.label}</div>
            </div>
          ))}
        </div>

        <div className="form-grid" style={{ marginTop: 18 }}>
          <input className="input" placeholder="Report title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <textarea className="textarea" placeholder="Report summary" value={summary} onChange={(e) => setSummary(e.target.value)} />
          <div className="btn-row">
            <button className="btn" type="button" onClick={saveSnapshot}>Save to Reports</button>
            <button className="btn btn-secondary" type="button" onClick={printCurrent}>Print</button>
            <button className="btn btn-secondary" type="button" onClick={exportCurrent}>Save CSV</button>
            <button className="btn btn-secondary" type="button" onClick={exportCurrentJson}>Save JSON</button>
          </div>
        </div>

        <div className="card-grid grid-2" style={{ marginTop: 20 }}>
          {chartGroups.map((group) => (
            <MetricBarChart key={group.title} title={group.title} items={group.items} />
          ))}
        </div>
      </section>

      <section className="card">
        <div className="section-kicker">Saved Reports</div>
        {reports.length === 0 ? (
          <div className="empty-state">No saved reports yet.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Report</th>
                  <th>Saved</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td>
                      <strong>{report.title}</strong>
                      <div className="helper">{report.summary || '—'}</div>
                    </td>
                    <td>{new Date(report.createdAt).toLocaleString()}</td>
                    <td>
                      <div className="btn-row">
                        <button className="btn btn-secondary" type="button" onClick={() => downloadPayload(report)}>Save JSON</button>
                        <button className="btn btn-secondary" type="button" onClick={() => deleteReport(report.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function escapeCsv(value: string) {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

function downloadPayload(report: SavedReport) {
  const blob = new Blob([report.payloadJson], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${slugify(report.title || 'report')}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function slugify(input: string) {
  return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || 'report';
}
