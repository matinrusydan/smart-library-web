import { Button } from "./Button";

export function Pagination({ page, pageSize, total, onPageChange, onPageSizeChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 mt-4" aria-label="Paginasi">
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
        <label htmlFor="page-size">Pilih data yang ingin ditampilkan:</label>
        <select id="page-size" value={pageSize} onChange={(event) => onPageSizeChange(Number(event.target.value))} className="rounded-md border border-border bg-surface px-3 py-2 text-text">
          {[10, 25, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}
        </select>
        <span>{total ? (page - 1) * pageSize + 1 : 0}–{Math.min(page * pageSize, total)} dari {total}</span>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>Sebelumnya</Button>
        <span aria-live="polite">{page} / {pages}</span>
        <Button variant="ghost" disabled={page >= pages} onClick={() => onPageChange(page + 1)}>Berikutnya</Button>
      </div>
    </nav>
  );
}
