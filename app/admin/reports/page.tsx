"use client";

import { useState } from "react";

export default function ReportsPage() {
  const [message, setMessage] = useState("");

  async function snapshot(type: string) {
    const res = await fetch("/api/admin/reports/snapshot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type })
    });
    const json = await res.json();
    setMessage(json.message || "Snapshot saved.");
  }

  return (
    <div className="grid-2">
      <div className="card">
        <div className="card-title">Report Snapshots</div>
        <div className="inline-actions">
          <button className="button" onClick={() => snapshot("overview")} type="button">Save Overview Snapshot</button>
          <button className="button button-secondary" onClick={() => snapshot("cashier")} type="button">Save Cashier Snapshot</button>
        </div>
        {message ? <div className="success-text" style={{ marginTop: 12 }}>{message}</div> : null}
      </div>
      <div className="card">
        <div className="card-title">Exports</div>
        <div className="list-stack">
          <a className="button" href="/api/admin/reports/export?dataset=inquiries&format=csv">Export Inquiries CSV</a>
          <a className="button button-secondary" href="/api/admin/reports/export?dataset=sponsors&format=json">Export Sponsors JSON</a>
          <a className="button button-secondary" href="/api/cashier/reports/summary?format=csv">Cashier Summary CSV</a>
          <a className="button button-secondary" href="/api/cashier/reports/summary?format=json">Cashier Summary JSON</a>
        </div>
      </div>
    </div>
  );
}
