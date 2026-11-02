export function DataTable({ columns, rows, getRowKey }) {
  return (
    <div className="overflow-x-auto rounded-lg"><table className="w-full border-collapse text-left text-xs sm:text-[13px]">
      <thead><tr>{columns.map(({ key, label }) => <th className="whitespace-nowrap bg-bg px-2 py-2 font-medium text-muted sm:px-3" key={key} scope="col">{label}</th>)}</tr></thead>
      <tbody>{rows.map((row) => <tr className="transition-colors hover:bg-bg/70" key={getRowKey(row)}>{columns.map(({ key, render }) => <td className="border-b border-border px-2 py-2 sm:px-3" key={key}>{render ? render(row) : row[key] ?? "—"}</td>)}</tr>)}</tbody>
    </table></div>
  );
}
