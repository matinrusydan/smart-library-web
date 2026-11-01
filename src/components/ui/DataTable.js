export function DataTable({ columns, rows, getRowKey }) {
  return (
    <div className="table-scroll"><table>
      <thead><tr>{columns.map(({ key, label }) => <th key={key} scope="col">{label}</th>)}</tr></thead>
      <tbody>{rows.map((row) => <tr key={getRowKey(row)}>{columns.map(({ key, render }) => <td key={key}>{render ? render(row) : row[key]}</td>)}</tr>)}</tbody>
    </table></div>
  );
}
