"use client";

type WorkflowFiltersProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusValue: string;
  onStatusChange: (value: string) => void;
  statusOptions: string[];
};

export function WorkflowFilters({
  searchValue,
  onSearchChange,
  statusValue,
  onStatusChange,
  statusOptions,
}: WorkflowFiltersProps) {
  return (
    <section className="dashboard-filters-bar">
      <div className="workflow-filters-grid">
        <div className="dashboard-filter-field">
          <label htmlFor="workflow-search">Search</label>
          <input
            id="workflow-search"
            value={searchValue}
            placeholder="Search records..."
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="dashboard-filter-field">
          <label htmlFor="workflow-status">Status</label>
          <select
            id="workflow-status"
            value={statusValue}
            onChange={(e) => onStatusChange(e.target.value)}
          >
            <option value="">All statuses</option>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  );
}
