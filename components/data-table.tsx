export function DataTable({
  columns,
  rows
}: {
  columns: Array<{ key: string; label: string }>;
  rows: Array<Record<string, any>>;
}) {
  if (!rows.length) {
    return <div className="card empty-state">No records yet.</div>;
  }

  return (
    <div className="card table-wrap">
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row.id ?? rowIndex}>
              {columns.map((column) => (
                <td key={column.key}>{String(row[column.key] ?? "—")}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
