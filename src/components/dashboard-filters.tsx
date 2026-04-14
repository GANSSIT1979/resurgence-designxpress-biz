"use client";

import type { ReactNode } from "react";

type FilterOption = {
  label: string;
  value: string;
};

type DashboardFiltersProps = {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  statusValue?: string;
  onStatusChange?: (value: string) => void;
  statusOptions?: FilterOption[];
  actions?: ReactNode;
};

export function DashboardFilters({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search records...",
  statusValue = "",
  onStatusChange,
  statusOptions = [],
  actions,
}: DashboardFiltersProps) {
  return (
    <section className="dashboard-filters-bar">
      <div className="dashboard-filters-grid">
        <div className="dashboard-filter-field">
          <label htmlFor="dashboard-search">Search</label>
          <input
            id="dashboard-search"
            value={searchValue}
            placeholder={searchPlaceholder}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>

        <div className="dashboard-filter-field">
          <label htmlFor="dashboard-status">Status</label>
          <select
            id="dashboard-status"
            value={statusValue}
            onChange={(e) => onStatusChange?.(e.target.value)}
          >
            <option value="">All statuses</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {actions ? <div className="dashboard-filters-actions">{actions}</div> : null}
    </section>
  );
}
