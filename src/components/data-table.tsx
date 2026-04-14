type ColumnDef = {
  key?: string;
  accessorKey?: string;
  label?: string;
  header?: string;
  render?: (item: Record<string, unknown>) => React.ReactNode;
};

type DataTableProps = {
  title?: string;
  subtitle?: string;
  columns: ColumnDef[];
  rows?: Record<string, unknown>[];
  items?: Record<string, unknown>[];
  emptyMessage?: string;
};

function columnKey(column: ColumnDef) {
  return column.key || column.accessorKey || column.label || column.header || "column";
}

function columnLabel(column: ColumnDef) {
  return column.label || column.header || column.key || column.accessorKey || "Column";
}

function displayValue(value: unknown) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return value as React.ReactNode;
}

export function DataTable({
  title = "Table",
  subtitle,
  columns,
  rows,
  items,
  emptyMessage = "No records available yet.",
}: DataTableProps) {
  const data = rows || items || [];

  return (
    <section className="card">
      <div style={{ marginBottom: 16 }}>
        <div className="card-title">{title}</div>
        {subtitle ? <div className="muted">{subtitle}</div> : null}
      </div>

      {!data.length ? (
        <div className="empty-state">{emptyMessage}</div>
      ) : (
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={columnKey(column)}>{columnLabel(column)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={String(item.id ?? index)}>
                  {columns.map((column) => {
                    if (typeof column.render === "function") {
                      return <td key={columnKey(column)}>{column.render(item)}</td>;
                    }

                    const value = item[column.key || column.accessorKey || ""];
                    return <td key={columnKey(column)}>{displayValue(value)}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
