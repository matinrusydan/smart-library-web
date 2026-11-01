export function DataTable({ columns, rows, getRowKey }) {
  return (
    <div className="overflow-x-auto"><table className="w-full border-collapse text-left text-sm">
      <thead><tr>{columns.map(({ key, label }) => <th className="border-b border-border px-3 py-2.5 font-medium text-muted" key={key} scope="col">{label}</th>)}</tr></thead>
      <tbody>{rows.map((row) => <tr key={getRowKey(row)}>{columns.map(({ key, render }) => <td className="border-b border-border px-3 py-2.5" key={key}>{render ? render(row) : row[key]}</td>)}</tr>)}</tbody>
    </table></div>
  );
}
