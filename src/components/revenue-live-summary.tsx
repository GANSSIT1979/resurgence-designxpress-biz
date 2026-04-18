"use client";

import { useEffect, useState } from "react";

type RevenueSummary = {
  totalGrossSales: number;
  totalNetRevenue: number;
  totalTalentFee: number;
  totalFranchiseAmount: number;
  totalCompanyShare: number;
  dtfSales: number;
  sublimationSales: number;
  merchandiseSales: number;
  sponsorshipRevenue: number;
  recordCount: number;
};

function formatCurrencyPHP(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 2,
  }).format(value || 0);
}

export function RevenueLiveSummary({
  summaryEndpoint,
  initialSummary,
}: {
  summaryEndpoint: string;
  initialSummary: RevenueSummary;
}) {
  const [summary, setSummary] = useState(initialSummary);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const res = await fetch(summaryEndpoint, { cache: "no-store" });
        const text = await res.text();
        const json = text ? JSON.parse(text) : {};
        if (active && json?.summary) {
          setSummary(json.summary);
        }
      } catch {}
    }

    const timer = setInterval(load, 15000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [summaryEndpoint]);

  return (
    <section className="dashboard-surface" style={{ padding: 18 }}>
      <div className="workflow-summary-grid">
        {[
          ["Gross Sales", formatCurrencyPHP(summary.totalGrossSales)],
          ["Net Revenue", formatCurrencyPHP(summary.totalNetRevenue)],
          ["Talent Fee", formatCurrencyPHP(summary.totalTalentFee)],
          ["Franchise", formatCurrencyPHP(summary.totalFranchiseAmount)],
          ["Company Share", formatCurrencyPHP(summary.totalCompanyShare)],
          ["DTF Sales", formatCurrencyPHP(summary.dtfSales)],
          ["Sublimation", formatCurrencyPHP(summary.sublimationSales)],
          ["Merchandise", formatCurrencyPHP(summary.merchandiseSales)],
          ["Sponsorship", formatCurrencyPHP(summary.sponsorshipRevenue)],
        ].map(([label, value]) => (
          <div key={String(label)} className="workflow-summary-card">
            <div className="workflow-summary-value" style={{ fontSize: "1.35rem" }}>{value}</div>
            <div className="workflow-summary-label">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
