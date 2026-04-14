"use client";

import { useEffect, useState } from "react";

export default function Page() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sponsor/billing")
      .then((res) => res.json())
      .then((json) => {
        setItems(json.items || []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="card">
      <div className="card-title">Billing</div>
      {loading ? (
        <div className="muted">Loading...</div>
      ) : items.length ? (
        <div className="list-stack">
          {items.map((item) => (
            <div className="list-item" key={item.id}>
              <div>
                <strong>{item.title || item.number || item.packageInterest || item.sponsorName}</strong>
                <div className="muted">{item.description || item.status || item.priceRange || item.customerName || ""}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">No records available.</div>
      )}
    </div>
  );
}
